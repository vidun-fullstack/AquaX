import { useState, useEffect } from 'react';
import { supabase } from "../../backend/supabase";

const useAddDevice = (visible, onClose) => {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [homeSSID, setHomeSSID] = useState('');
  const [homePass, setHomePass] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [tankName, setTankName] = useState('');
  const [error, setError] = useState('');
  const [foundDevice, setFoundDevice] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode(null);
      setStep(0);
      setHomeSSID('');
      setHomePass('');
      setIpAddress('');
      setTankName('');
      setError('');
      setFoundDevice(null);
      setSending(false);
    }
  }, [visible]);

  const reset = () => {
    setMode(null);
    setStep(0);
    setError('');
  };

  const handleSendCredentials = async () => {
    if (!homeSSID.trim()) {
      setError('Please enter Wi-Fi network name');
      return;
    }
    if (!homePass.trim()) {
      setError('Please enter Wi-Fi password');
      return;
    }

    setError('');
    setSending(true);
    setStep(4);

    await new Promise(resolve => setTimeout(resolve, 2800));

    setSending(false);

    setFoundDevice({
      device_id: 'AQX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      model: 'AquaX Pi v2',
      firmware: '1.3.2'
    });

    setStep(5);
  };

  const handleConnectByIP = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter IP address');
      return;
    }

    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress.trim())) {
      setError('Invalid IP format');
      return;
    }

    setError('');
    setStep(2);

    await new Promise(resolve => setTimeout(resolve, 2200));

    setFoundDevice({
      device_id: 'AQX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      model: 'AquaX Pi v2',
      firmware: '1.3.2'
    });

    setStep(3);
  };

  const handleSave = async () => {
    if (!tankName.trim()) {
      setError('Please enter a tank name');
      return;
    }

    setError('');
    const finalStep = mode === 'ap' ? 6 : 4;
    setStep(finalStep);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            device_name: tankName.trim() 
          }, { onConflict: 'user_id' });
      }
    } catch (err) {
      console.log("Error saving tank name:", err);
    }

    setTimeout(() => {
      onClose();
      reset();
    }, 1800);
  };

  const totalSteps = mode === 'ap' ? 6 : mode === 'ip' ? 4 : 0;

  return {
    mode,      setMode,
    step,      setStep,
    homeSSID,  setHomeSSID,
    homePass,  setHomePass,
    ipAddress, setIpAddress,
    tankName,  setTankName,
    error,     setError,
    foundDevice,
    sending,
    totalSteps,
    reset,
    handleSendCredentials,
    handleConnectByIP,
    handleSave,
  };
};

export default useAddDevice;
