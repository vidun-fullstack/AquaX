import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles, COLORS } from '../styles/styles';
import { supabase } from "../../backend/supabase";

const ProfileScreen = ({ goBack }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    // Handle back button (Android hardware back button)
    const backAction = () => {
      if (goBack) {
        goBack();
      }
      return true; // prevent app from closing
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [goBack]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        <Text style={[styles.sectionLabel, { marginTop: 10 }]}>ACCOUNT INFORMATION</Text>
        
        {/* Details Card */}
        <View style={styles.settingsGroup}>
          <View style={[styles.settingItem, styles.borderBottom]}>
             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: COLORS.bg, padding: 8, borderRadius: 8, marginRight: 16 }}>
                  <Feather name="user" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 2 }}>Full Name</Text>
                  <Text style={{ fontSize: 16, color: COLORS.text, fontWeight: '500' }}>
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </Text>
                </View>
             </View>
          </View>

          <View style={styles.settingItem}>
             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: COLORS.bg, padding: 8, borderRadius: 8, marginRight: 16 }}>
                  <Feather name="mail" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 2 }}>Email Address</Text>
                  <Text style={{ fontSize: 16, color: COLORS.text, fontWeight: '500' }}>
                    {user?.email || 'No email found'}
                  </Text>
                </View>
             </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={{ 
            marginTop: 40, 
            backgroundColor: 'transparent', 
            borderWidth: 1, 
            borderColor: COLORS.danger, 
            borderRadius: 12, 
            paddingVertical: 14, 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
          <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: 'bold' }}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;