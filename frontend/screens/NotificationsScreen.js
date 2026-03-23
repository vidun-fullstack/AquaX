import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, BackHandler, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles, COLORS } from '../styles/styles';
import { supabase } from "../../backend/supabase";

const DEFAULTS = {
  tempMin: 24,
  tempMax: 28,
  phMin: 6.5,
  phMax: 7.5,
  turbMin: 0,
  turbMax: 5
};

const toF = (c) => (c * 9) / 5 + 32;

const NotificationsScreen = ({ goBack }) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [useDefaultTemp, setUseDefaultTemp] = useState(true);
  const [useDefaultPh, setUseDefaultPh] = useState(true);
  const [useDefaultTurb, setUseDefaultTurb] = useState(true);
  const [tempMin, setTempMin] = useState('24');
  const [tempMax, setTempMax] = useState('28');
  const [unit, setUnit] = useState('C');
  const [phMin, setPhMin] = useState('6.5');
  const [phMax, setPhMax] = useState('7.5');
  const [turbMin, setTurbMin] = useState('0');
  const [turbMax, setTurbMax] = useState('5');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  useEffect(() => {
    const backAction = () => {
      if (goBack) goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [goBack]);

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const userId = data.user.id;
      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();

      if (settings) {
        setAlertsEnabled(settings.alerts_enabled ?? true);
        setUseDefaultTemp(settings.use_default_temp ?? true);
        setTempMin(settings.temp_min?.toString() ?? '24');
        setTempMax(settings.temp_max?.toString() ?? '28');
        setUnit(settings.temp_unit ?? 'C');
        setUseDefaultPh(settings.use_default_ph ?? true);
        setPhMin(settings.ph_min?.toString() ?? '6.5');
        setPhMax(settings.ph_max?.toString() ?? '7.5');
        setUseDefaultTurb(settings.use_default_turb ?? true);
        setTurbMin(settings.turbidity_min?.toString() ?? '0');
        setTurbMax(settings.turbidity_max?.toString() ?? '5');
        setPushEnabled(settings.push_enabled ?? false);
        setInAppEnabled(settings.in_app_enabled ?? true);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) {
        Alert.alert("Error", "User not found");
        return;
      }
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        alerts_enabled: alertsEnabled,
        use_default_temp: useDefaultTemp,
        temp_min: useDefaultTemp ? null : parseFloat(tempMin),
        temp_max: useDefaultTemp ? null : parseFloat(tempMax),
        temp_unit: unit,
        use_default_ph: useDefaultPh,
        ph_min: useDefaultPh ? null : parseFloat(phMin),
        ph_max: useDefaultPh ? null : parseFloat(phMax),
        use_default_turb: useDefaultTurb,
        turbidity_min: useDefaultTurb ? null : parseFloat(turbMin),
        turbidity_max: useDefaultTurb ? null : parseFloat(turbMax),
        push_enabled: pushEnabled,
        in_app_enabled: inAppEnabled
      }, { onConflict: 'user_id' });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Settings saved successfully");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const adjustValue = (setter, amount, isFloat = false) => {
    setter(prev => {
      const current = parseFloat(prev);
      if (isNaN(current)) return isFloat ? '0.0' : '0';
      const newVal = current + amount;
      return isFloat ? newVal.toFixed(1) : Math.round(newVal).toString();
    });
  };

  const getTempValues = () => {
    let min = useDefaultTemp ? DEFAULTS.tempMin : parseFloat(tempMin);
    let max = useDefaultTemp ? DEFAULTS.tempMax : parseFloat(tempMax);
    if (unit === 'F') {
      min = toF(min);
      max = toF(max);
    }
    return {
      min: isNaN(min) ? '' : min.toFixed(1),
      max: isNaN(max) ? '' : max.toFixed(1)
    };
  };

  const tempValues = getTempValues();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.settingsGroup, { marginBottom: 24 }]}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingText}>Enable Monitoring Alerts</Text>
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Receive warnings when metrics are out of range</Text>
            </View>
            <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
          </View>
        </View>
        <Text style={styles.sectionLabel}>METRIC THRESHOLDS</Text>
        <View style={styles.settingsGroup}>
          <View style={[styles.settingItem, styles.borderBottom, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="thermometer" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
                <Text style={styles.settingText}>Temperature</Text>
              </View>
              <View style={{ flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 6 }}>
                <TouchableOpacity onPress={() => setUnit('C')} style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: unit === 'C' ? COLORS.primary : 'transparent', borderRadius: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: unit === 'C' ? COLORS.surface : COLORS.textLight }}>C</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUnit('F')} style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: unit === 'F' ? COLORS.primary : 'transparent', borderRadius: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: unit === 'F' ? COLORS.surface : COLORS.textLight }}>F</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 8, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setUseDefaultTemp(true)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: useDefaultTemp ? COLORS.surface : 'transparent', borderRadius: 6, elevation: useDefaultTemp ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: useDefaultTemp ? '600' : '400', color: useDefaultTemp ? COLORS.text : COLORS.textLight }}>Default</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUseDefaultTemp(false)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: !useDefaultTemp ? COLORS.surface : 'transparent', borderRadius: 6, elevation: !useDefaultTemp ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: !useDefaultTemp ? '600' : '400', color: !useDefaultTemp ? COLORS.text : COLORS.textLight }}>Custom</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MINIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultTemp ? tempValues.min : tempMin} editable={!useDefaultTemp} onChangeText={setTempMin} keyboardType="numeric" />
                  {!useDefaultTemp && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setTempMin, 1)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setTempMin, -1)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MAXIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultTemp ? tempValues.max : tempMax} editable={!useDefaultTemp} onChangeText={setTempMax} keyboardType="numeric" />
                  {!useDefaultTemp && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setTempMax, 1)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setTempMax, -1)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.settingItem, styles.borderBottom, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Feather name="droplet" size={18} color={COLORS.success} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>pH Level</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 8, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setUseDefaultPh(true)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: useDefaultPh ? COLORS.surface : 'transparent', borderRadius: 6, elevation: useDefaultPh ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: useDefaultPh ? '600' : '400', color: useDefaultPh ? COLORS.text : COLORS.textLight }}>Default</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUseDefaultPh(false)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: !useDefaultPh ? COLORS.surface : 'transparent', borderRadius: 6, elevation: !useDefaultPh ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: !useDefaultPh ? '600' : '400', color: !useDefaultPh ? COLORS.text : COLORS.textLight }}>Custom</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MINIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultPh ? DEFAULTS.phMin.toString() : phMin} editable={!useDefaultPh} onChangeText={setPhMin} keyboardType="numeric" />
                  {!useDefaultPh && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setPhMin, 0.1, true)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setPhMin, -0.1, true)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MAXIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultPh ? DEFAULTS.phMax.toString() : phMax} editable={!useDefaultPh} onChangeText={setPhMax} keyboardType="numeric" />
                  {!useDefaultPh && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setPhMax, 0.1, true)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setPhMax, -0.1, true)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.settingItem, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Feather name="alert-triangle" size={18} color={COLORS.warning} style={{ marginRight: 8 }} />
              <Text style={styles.settingText}>Turbidity (NTU)</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 8, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setUseDefaultTurb(true)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: useDefaultTurb ? COLORS.surface : 'transparent', borderRadius: 6, elevation: useDefaultTurb ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: useDefaultTurb ? '600' : '400', color: useDefaultTurb ? COLORS.text : COLORS.textLight }}>Default</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUseDefaultTurb(false)} style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: !useDefaultTurb ? COLORS.surface : 'transparent', borderRadius: 6, elevation: !useDefaultTurb ? 1 : 0 }}>
                <Text style={{ fontSize: 12, fontWeight: !useDefaultTurb ? '600' : '400', color: !useDefaultTurb ? COLORS.text : COLORS.textLight }}>Custom</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MINIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultTurb ? DEFAULTS.turbMin.toString() : turbMin} editable={!useDefaultTurb} onChangeText={setTurbMin} keyboardType="numeric" />
                  {!useDefaultTurb && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setTurbMin, 1)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setTurbMin, -1)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginBottom: 4, fontWeight: 'bold' }}>MAXIMUM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8 }}>
                  <TextInput style={[styles.input, { paddingVertical: 8, paddingHorizontal: 0, textAlign: 'center' }]} value={useDefaultTurb ? DEFAULTS.turbMax.toString() : turbMax} editable={!useDefaultTurb} onChangeText={setTurbMax} keyboardType="numeric" />
                  {!useDefaultTurb && (
                    <View style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border, height: 36, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => adjustValue(setTurbMax, 1)}><Feather name="chevron-up" size={16} color={COLORS.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustValue(setTurbMax, -1)}><Feather name="chevron-down" size={16} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.sectionLabel}>NOTIFICATION DELIVERY</Text>
        <View style={styles.settingsGroup}>
          <View style={[styles.settingItem, styles.borderBottom]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="smartphone" size={18} color={COLORS.textLight} style={{ marginRight: 12 }} />
              <Text style={styles.settingText}>In-App Alerts</Text>
            </View>
            <Switch value={inAppEnabled} onValueChange={setInAppEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
          </View>
          <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="bell" size={18} color={COLORS.textLight} style={{ marginRight: 12 }} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
          </View>
        </View>
        <TouchableOpacity style={[styles.btnBase, styles.btnPrimary, { marginTop: 32 }]} onPress={saveSettings}>
          <Text style={[styles.btnText, { color: COLORS.surface }]}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;