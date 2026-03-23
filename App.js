import React, { useState, useEffect } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { styles, COLORS } from './frontend/styles/styles';
import { supabase } from './backend/supabase';

import AuthScreen from './frontend/screens/AuthScreen';
import HomeScreen from './frontend/screens/HomeScreen';
import AlertsScreen from './frontend/screens/AlertsScreen';
import SettingsScreen from './frontend/screens/SettingsScreen';
import ProfileScreen from './frontend/screens/ProfileScreen';
import NotificationsScreen from './frontend/screens/NotificationsScreen';
import AddDeviceScreen from './frontend/screens/AddDeviceScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(true);

  // Real auth persistence
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveTab('home');
    setCurrentScreen(null);
    setShowAddDevice(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {!isAuthenticated ? (
          <AuthScreen onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <>
            <View style={{ flex: 1 }}>
              {currentScreen === 'profile' ? (
                <ProfileScreen goBack={() => setCurrentScreen(null)} />
              ) : currentScreen === 'notifications' ? (
                <NotificationsScreen goBack={() => setCurrentScreen(null)} />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <HomeScreen openAddDevice={() => setShowAddDevice(true)} />
                  )}
                  {activeTab === 'alerts' && <AlertsScreen />}
                  {activeTab === 'settings' && (
                    <SettingsScreen
                      openProfile={() => setCurrentScreen('profile')}
                      openNotifications={() => setCurrentScreen('notifications')}
                      onLogout={handleLogout}
                    />
                  )}
                </>
              )}
            </View>

            {/* Tab bar - hidden when in sub-screens or add device */}
            {!currentScreen && !showAddDevice && (
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => {
                    setCurrentScreen(null);
                    setActiveTab('home');
                  }}
                >
                  <Feather
                    name="home"
                    size={24}
                    color={activeTab === 'home' ? COLORS.primary : COLORS.textLight}
                  />
                  <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => {
                    setCurrentScreen(null);
                    setActiveTab('alerts');
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <Feather
                      name="bell"
                      size={24}
                      color={activeTab === 'alerts' ? COLORS.primary : COLORS.textLight}
                    />
                    {hasAlerts && <View style={styles.badge} />}
                  </View>
                  <Text style={[styles.tabLabel, activeTab === 'alerts' && styles.activeTabLabel]}>
                    Alerts
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tabItem}
                  onPress={() => {
                    setCurrentScreen(null);
                    setActiveTab('settings');
                  }}
                >
                  <Feather
                    name="settings"
                    size={24}
                    color={activeTab === 'settings' ? COLORS.primary : COLORS.textLight}
                  />
                  <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>
                    Settings
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Add Device Screen as overlay */}
            {showAddDevice && (
              <AddDeviceScreen onClose={() => setShowAddDevice(false)} />
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}