import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles, COLORS } from '../styles/styles';
import { supabase } from "../../backend/supabase"; 

const MOCK_DEVICES = [
  { id: 'dev1', name: 'Main Tank Filter', status: 'active' },
  { id: 'dev2', name: 'Aquarium camera', status: 'active' },
];

const SettingsScreen = ({ openProfile, openNotifications, onLogout }) => {

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      // logout success → go back to auth screen
      if (onLogout) {
        onLogout();
      }

    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

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
        Settings
      </Text>

      <Text style={styles.sectionLabel}>GENERAL</Text>
      <View style={styles.settingsGroup}>
        {['Profile', 'Notifications', 'App Appearance'].map((item, index) => (
          <TouchableOpacity
            key={item}
            onPress={() => {
              if (item === 'Profile') openProfile();
              if (item === 'Notifications') openNotifications();
            }}
            style={[styles.settingItem, index !== 2 && styles.borderBottom]}
          >
            <Text style={styles.settingText}>{item}</Text>
            <Feather name="chevron-right" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>HARDWARE</Text>
      <View style={styles.settingsGroup}>
        {MOCK_DEVICES.map((dev, index) => (
          <TouchableOpacity
            key={dev.id}
            style={[styles.settingItem, index !== MOCK_DEVICES.length - 1 && styles.borderBottom]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.statusDot} />
              <Text style={styles.settingText}>{dev.name}</Text>
            </View>
            <Text style={styles.versionText}>v1.0</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.settingItem}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
            + Manage Devices
          </Text>
        </TouchableOpacity>
      </View>

      
      <TouchableOpacity
        onPress={handleSignOut}
        style={[styles.btnBase, styles.btnDanger, { marginTop: 40 }]}
      >
        <Text style={{ color: COLORS.danger, fontWeight: '600' }}>
          Sign Out
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default SettingsScreen;