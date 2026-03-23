import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { styles, COLORS } from '../styles/styles';
import { supabase } from "../../backend/supabase"; // Added Supabase import

const MOCK_ALERTS = [
  { id: 1, type: "critical", message: "Turbidity levels rising", time: "10m ago" },
  { id: 2, type: "warning", message: "Water quality low", time: "1h ago" },
  { id: 3, type: "info", message: "Feeding schedule complete", time: "3h ago" },
  { id: 4, type: "info", message: "System update available", time: "1d ago" },
];

const AlertsScreen = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user settings to get thresholds
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch latest sensor reading
        const { data: reading } = await supabase
          .from('sensor_readings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reading && isMounted) {
          let currentTemp = reading.temp;
          const currentPh = reading.ph;
          const currentTurb = reading.turbidity;

          const tempUnit = settings?.temp_unit || 'C';

          if (tempUnit === 'F' && currentTemp !== null) {
            currentTemp = (currentTemp * 9) / 5 + 32;
          }

          const newAlerts = [];
          let alertId = 1;

          // Check Temperature
          if (currentTemp !== null) {
            let minTemp = (settings?.use_default_temp ?? true) ? 24 : settings.temp_min;
            let maxTemp = (settings?.use_default_temp ?? true) ? 28 : settings.temp_max;

            if (tempUnit === 'F' && (settings?.use_default_temp ?? true)) {
              minTemp = (24 * 9) / 5 + 32;
              maxTemp = (28 * 9) / 5 + 32;
            }

            if (currentTemp < minTemp) {
              newAlerts.push({ id: alertId++, type: "critical", message: `Temperature dropping low (${currentTemp}°${tempUnit})`, time: "Just now" });
            } else if (currentTemp > maxTemp) {
              newAlerts.push({ id: alertId++, type: "critical", message: `Temperature rising high (${currentTemp}°${tempUnit})`, time: "Just now" });
            }
          }

          // Check pH
          if (currentPh !== null) {
            const minPh = (settings?.use_default_ph ?? true) ? 6.5 : settings.ph_min;
            const maxPh = (settings?.use_default_ph ?? true) ? 7.5 : settings.ph_max;

            if (currentPh < minPh) {
              newAlerts.push({ id: alertId++, type: "warning", message: `pH level too acidic (${currentPh.toFixed(1)})`, time: "Just now" });
            } else if (currentPh > maxPh) {
              newAlerts.push({ id: alertId++, type: "warning", message: `pH level too alkaline (${currentPh.toFixed(1)})`, time: "Just now" });
            }
          }

          // Check Turbidity
          if (currentTurb !== null) {
            const minTurb = (settings?.use_default_turb ?? true) ? 0 : settings.turbidity_min;
            const maxTurb = (settings?.use_default_turb ?? true) ? 5 : settings.turbidity_max;

            if (currentTurb < minTurb) {
              newAlerts.push({ id: alertId++, type: "info", message: `Turbidity below range (${currentTurb.toFixed(1)} NTU)`, time: "Just now" });
            } else if (currentTurb > maxTurb) {
              newAlerts.push({ id: alertId++, type: "critical", message: `Turbidity levels rising (${currentTurb.toFixed(1)} NTU)`, time: "Just now" });
            }
          }

          setActiveAlerts(newAlerts);
        }
      } catch (err) {
        console.log("Error syncing alerts on Alerts Screen:", err);
      }
    };

    fetchAlerts();

    // Check for updates every 5 seconds just like the Home Screen
    const interval = setInterval(fetchAlerts, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Determine which alerts to show (use real ones if we have them, fallback to mock data)
  const displayAlerts = activeAlerts.length > 0 ? activeAlerts : MOCK_ALERTS;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 }}>
        All Alerts
      </Text>

      {displayAlerts.map((alert) => (
        <View key={alert.id} style={styles.alertItem}>
          <View
            style={[
              styles.alertDot,
              alert.type === "critical"
                ? { backgroundColor: COLORS.danger }
                : alert.type === "warning"
                ? { backgroundColor: COLORS.warning }
                : { backgroundColor: COLORS.primary },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertMsg}>{alert.message}</Text>
            <Text style={styles.alertTime}>{alert.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default AlertsScreen;
