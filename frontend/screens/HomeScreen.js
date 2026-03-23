import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { styles, COLORS } from '../styles/styles';
import MetricCard from '../components/MetricCard';
import { supabase } from "../../backend/supabase";
import AddDeviceScreen from './AddDeviceScreen';

const MOCK_ALERTS = [
  { id: 1, type: "critical", message: "Turbidity levels rising", time: "10m ago" },
  { id: 2, type: "warning", message: "Water quality low", time: "1h ago" },
  { id: 3, type: "info", message: "Feeding schedule complete", time: "3h ago" },
];

const HomeScreen = ({ openAddDevice }) => {
  const [liveMetrics, setLiveMetrics] = useState({ temp: null, ph: null, turbidity: null });
  const [unit, setUnit] = useState('C');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [showLiveStream, setShowLiveStream] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveReadingsAndSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settings && isMounted) {
          setUserSettings(settings);
        }

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
          setUnit(tempUnit);

          if (tempUnit === 'F' && currentTemp !== null) {
            currentTemp = (currentTemp * 9) / 5 + 32;
          }

          setLiveMetrics({
            temp: currentTemp !== null ? currentTemp.toFixed(1) : null,
            ph: currentPh !== null ? currentPh.toFixed(1) : null,
            turbidity: currentTurb !== null ? currentTurb.toFixed(1) : null
          });

          const newAlerts = [];
          let alertId = 1;

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

          if (currentPh !== null) {
            const minPh = (settings?.use_default_ph ?? true) ? 6.5 : settings.ph_min;
            const maxPh = (settings?.use_default_ph ?? true) ? 7.5 : settings.ph_max;

            if (currentPh < minPh) {
              newAlerts.push({ id: alertId++, type: "warning", message: `pH level too acidic (${currentPh.toFixed(1)})`, time: "Just now" });
            } else if (currentPh > maxPh) {
              newAlerts.push({ id: alertId++, type: "warning", message: `pH level too alkaline (${currentPh.toFixed(1)})`, time: "Just now" });
            }
          }

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
      } catch (err) {}
    };

    fetchLiveReadingsAndSettings();

    const interval = setInterval(fetchLiveReadingsAndSettings, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getMetricStatus = (metricType, valueString) => {
    if (!valueString || !userSettings) return "Good";
    const value = parseFloat(valueString);

    let min, max;

    if (metricType === 'temp') {
      min = (userSettings?.use_default_temp ?? true) ? 24 : userSettings.temp_min;
      max = (userSettings?.use_default_temp ?? true) ? 28 : userSettings.temp_max;
      if (unit === 'F' && (userSettings?.use_default_temp ?? true)) {
        min = (24 * 9) / 5 + 32;
        max = (28 * 9) / 5 + 32;
      }
    } else if (metricType === 'ph') {
      min = (userSettings?.use_default_ph ?? true) ? 6.5 : userSettings.ph_min;
      max = (userSettings?.use_default_ph ?? true) ? 7.5 : userSettings.ph_max;
    } else if (metricType === 'turbidity') {
      min = (userSettings?.use_default_turb ?? true) ? 0 : userSettings.turbidity_min;
      max = (userSettings?.use_default_turb ?? true) ? 5 : userSettings.turbidity_max;
    }

    if (value < min || value > max) return "Warning";
    return "Good";
  };

  const handleCameraPress = () => {
    const isCameraConnected = userSettings?.camera_connected ?? false;
    const streamUrl = userSettings?.stream_url;
    
    if (!isCameraConnected && !streamUrl) {
      Alert.alert(
        "Camera Disconnected",
        "No live feed detected. Please ensure your camera module is connected to the Raspberry Pi.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      setShowLiveStream(true);
    }
  };

  const tankName = userSettings?.device_name || userSettings?.tank_name || userSettings?.aquarium_name || userSettings?.name || 'My Aquarium';
  const feedImageUri = userSettings?.stream_url || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1600&q=80';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 100
      }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{tankName}</Text>
          <Text style={styles.headerSub}>Main Tank • 50 Gallons</Text>
        </View>

        <TouchableOpacity onPress={openAddDevice} style={styles.addBtn}>
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="camera" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Live View</Text>
        </View>

        <TouchableOpacity 
          style={styles.feedContainer} 
          activeOpacity={0.8} 
          onPress={handleCameraPress}
        >
          <Image
            source={{ uri: feedImageUri }}
            style={styles.feedImage}
            resizeMode="cover"
          />

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="water-outline" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Water Quality</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsRow}
        >
          <MetricCard
            label="Temperature"
            value={liveMetrics.temp ? `${liveMetrics.temp}°${unit}` : "--"}
            iconName="thermometer"
            iconColor="#ef4444"
            bgColor="#fee2e2"
            status={getMetricStatus('temp', liveMetrics.temp)}
          />

          <MetricCard
            label="pH Level"
            value={liveMetrics.ph ?? "--"}
            iconName="droplet"
            iconColor="#22c55e"
            bgColor="#dcfce7"
            status={getMetricStatus('ph', liveMetrics.ph)}
          />

          <MetricCard
            label="Turbidity"
            value={liveMetrics.turbidity ? `${liveMetrics.turbidity} NTU` : "--"}
            iconName="alert-triangle"
            iconColor="#eab308"
            bgColor="#fef9c3"
            status={getMetricStatus('turbidity', liveMetrics.turbidity)}
          />
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="bell" size={18} color="#f97316" />
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
        </View>

        {activeAlerts.length > 0 ? (
          activeAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View
                style={[
                  styles.alertDot,
                  alert.type === "critical" ? { backgroundColor: COLORS.danger } :
                  alert.type === "warning"  ? { backgroundColor: COLORS.warning } :
                  { backgroundColor: COLORS.primary },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertMsg}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={COLORS.border} />
            </View>
          ))
        ) : (
          MOCK_ALERTS.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View
                style={[
                  styles.alertDot,
                  alert.type === "critical" ? { backgroundColor: COLORS.danger } :
                  alert.type === "warning"  ? { backgroundColor: COLORS.warning } :
                  { backgroundColor: COLORS.primary },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertMsg}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={COLORS.border} />
            </View>
          ))
        )}
      </View>

      {showAddDevice && (
        <AddDeviceScreen onClose={() => setShowAddDevice(false)} />
      )}

      <Modal 
        visible={showLiveStream} 
        animationType="fade" 
        transparent={true} 
        onRequestClose={() => setShowLiveStream(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 }} 
            onPress={() => setShowLiveStream(false)}
          >
            <Feather name="x" size={32} color="#fff" />
          </TouchableOpacity>
          <Image 
            source={{ uri: userSettings?.stream_url }} 
            style={{ width: '100%', height: 300 }} 
            resizeMode="contain" 
          />
          <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>Live Camera Feed</Text>
        </View>
      </Modal>

    </ScrollView>
  );
};

export default HomeScreen;
