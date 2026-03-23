import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles, COLORS } from '../styles/styles';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from "../../backend/supabase"; // <-- NEW: Imported Supabase

const AddDeviceScreen = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [tankName, setTankName] = useState('');

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSendWifi = () => {
    if (!ssid.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both SSID and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 1800);
  };

  // NEW: Made this function async and added database logic
  const handleSaveTank = async () => {
    if (!tankName.trim()) {
      Alert.alert('Missing name', 'Please give your tank a name');
      return;
    }

    try {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Save the tank name to Supabase
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            device_name: tankName.trim() 
          }, { onConflict: 'user_id' });

        if (error) {
          console.error("Supabase upsert error:", error);
          Alert.alert("Error", "Could not save tank name.");
          return;
        }
      }

      // 3. Show success and close modal
      Alert.alert(
        'Success',
        `Tank "${tankName}" added successfully!`,
        [{ text: 'OK', onPress: onClose }]
      );

    } catch (err) {
      console.log("Error saving tank name:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const renderProgress = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16 }}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: s <= step ? COLORS.primary : COLORS.border,
            marginHorizontal: 6,
          }}
        />
      ))}
    </View>
  );

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Feather name="zap" size={80} color={COLORS.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 12 }}>
            Power on your AquaX device
          </Text>
          <Text style={{ color: COLORS.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
            Plug in the Raspberry Pi using the included power cable. Wait about 30 seconds for it to start up.
          </Text>
          <View style={{ backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, marginBottom: 24 }}>
            <Text style={{ color: '#166534', fontWeight: '500' }}>
              The green LED on the Pi will stop blinking when it is ready.
            </Text>
          </View>
          <Button onPress={nextStep}>Pi is powered on — next</Button>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Feather name="wifi" size={80} color={COLORS.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 12 }}>
            Connect to AquaX hotspot
          </Text>
          <Text style={{ color: COLORS.textLight, textAlign: 'center', marginBottom: 16 }}>
            Go to your phone's Wi-Fi settings and connect to:
          </Text>
          <View style={{ backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary }}>
              AquaX-Setup
            </Text>
            <Text style={{ color: COLORS.textLight, marginTop: 4 }}>
              No password needed
            </Text>
          </View>
          <Text style={{ color: COLORS.textLight, textAlign: 'center', marginBottom: 24 }}>
            Your internet will disconnect temporarily — that is normal. Come back after connecting.
          </Text>
          <Button onPress={nextStep}>Connected to AquaX-Setup — next</Button>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Feather name="home" size={48} color={COLORS.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 8 }}>
            Enter your home Wi-Fi
          </Text>
          <Text style={{ color: COLORS.textLight, textAlign: 'center', marginBottom: 24 }}>
            Pi will connect to this network
          </Text>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: COLORS.textLight, marginBottom: 8 }}>Wi-Fi network name (SSID):</Text>
            <Input
              placeholder="e.g. MyHomeWiFi"
              value={ssid}
              onChangeText={setSsid}
            />
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: COLORS.textLight, marginBottom: 8 }}>Wi-Fi password:</Text>
            <Input
              placeholder="Your Wi-Fi password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              rightIcon="eye"
              onRightIconPress={() => {}}
            />
          </View>
          <Button onPress={handleSendWifi} disabled={loading}>
            {loading ? 'Sending...' : 'Send to AquaX device'}
          </Button>
        </>
      );
    }

    if (step === 4) {
      return (
        <>
          <View style={{ backgroundColor: '#dcfce7', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' }}>
            <Feather name="check-circle" size={48} color="#16a34a" />
            <Text style={{ color: '#166534', fontWeight: '600', marginTop: 12, fontSize: 16 }}>
              AquaX device is online!
            </Text>
            <Text style={{ color: '#166534', marginTop: 4, textAlign: 'center' }}>
              Raspberry Pi 3B+ • firmware 1.0.2 • tank_XXXXXX
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>
            Give this tank a name:
          </Text>
          <Input
            placeholder="e.g. Living Room Tank, Tank 2..."
            value={tankName}
            onChangeText={setTankName}
          />
          <Button onPress={handleSaveTank} style={{ marginTop: 24 }}>
            Save Tank
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { paddingTop: 20 }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add AquaX Device</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {renderProgress()}

        {renderStep()}

        {step > 1 && step < 4 && (
          <TouchableOpacity onPress={prevStep} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textLight, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
        )}

        {step === 4 && (
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textLight, fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AddDeviceScreen;
