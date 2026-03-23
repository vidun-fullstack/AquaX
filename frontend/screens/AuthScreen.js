import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styles } from '../styles/styles';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from "../../backend/supabase";

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidFullName = (name) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2 && parts[0] && parts[1];
  };

  const handleAuth = async () => {
    if (loading) return;

    if (isLogin){
      if (!email && !password) {
        Alert.alert("Missing Information", "Please enter your email and password to continue.");
        return;
      }
      if (!email) {
        Alert.alert("Missing Email", "Please enter your email address.");
        return;
      }
      if (!password) {
        Alert.alert("Missing Password", "Please enter your password.");
        return;
      }
    } else {
      if (!fullName && !email && !password) {
        Alert.alert("Missing Information", "Please enter your full name, email, and password to create an account.");
        return;
      }
      if (!fullName) {
        Alert.alert("Full Name Required", "Please enter your first and last name.");
        return;
      }
      if (!isValidFullName(fullName)) {
        Alert.alert("Invalid Name", "Enter your full name (first name and last name).");
        return;
      }
      if (!email) {
        Alert.alert("Email Required", "Please enter your email address.");
        return;
      }
      if (!isValidEmail(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address (e.g., example@gmail.com).");
        return;
      }
      if (!password) {
        Alert.alert("Password Required", "Please enter a password.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Weak Password", "Password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("invalid") ||
            error.message.toLowerCase().includes("credentials")
          ) {
            Alert.alert(
              "Account Not Found",
              "No account found with this email. Please sign up first."
            );
            setIsLogin(false);
            setFullName("");
            setPassword("");
          } else {
            Alert.alert("Login Failed", "Unable to log in. Please try again.");
          }
        } else {
          const user = data.user;
          if (user) {
            await supabase.from("profiles").upsert({
              id: user.id,
              email: email.trim(),
            });
          }
          onLogin();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("already") ||
            error.message.toLowerCase().includes("exists") ||
            error.message.toLowerCase().includes("registered")
          ) {
            Alert.alert(
              "Email Already Registered",
              "This email is already in use. Please sign in instead."
            );
            setIsLogin(true);
            setPassword("");
          } else {
            Alert.alert("Signup Error", "Unable to create account. Please try again.");
          }
          setLoading(false);
          return;
        }

        const user = data.user;

        if (user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: user.id,
            email: email.trim(),
            name: fullName,
          });

          if (profileError) {
            console.warn("Profile upsert failed (Check RLS policies):", profileError);
          }
        }

        Alert.alert("Success", "Account created successfully!");
        setEmail("");
        setPassword("");
        setFullName("");

        onLogin();
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      <KeyboardAwareScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Image
                source={require('../assets/aquax-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>AquaX</Text>
            <Text style={styles.appSubtitle}>Smart Aquarium Management</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>

            {!isLogin && <Input iconName="user" placeholder="Full Name" value={fullName} onChangeText={setFullName} />}

            <Input iconName="mail" placeholder="Email Address" value={email} onChangeText={setEmail} />
            <Input iconName="lock" placeholder="Password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} rightIcon={showPassword ? "eye-off" : "eye"} onRightIconPress={() => setShowPassword(!showPassword)} />

            <Button onPress={handleAuth} style={{ marginTop: 10 }}>
              {loading ? <ActivityIndicator color="#fff" /> : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>

            <View style={styles.switchAuthBtn}>
              <Text style={styles.switchAuthText}>
                {isLogin ?(
                  <>
                    Don't have an account?{" "}
                    <Text 
                      style={{ fontWeight: 'bold' }}
                      onPress={() => {
                        setIsLogin(false);
                        setEmail("");
                        setPassword("");
                        setFullName("");
                      }}
                    >
                      Sign up
                    </Text>
                  </>
                  ) : (
                    <>
                      Already have an account?{" "}  
                    <Text 
                      style={{ fontWeight: 'bold' }}
                      onPress={() => {
                        setIsLogin(true);
                        setEmail("");
                        setPassword("");
                        setFullName("");
                      }}
                    >
                      Sign in
                      </Text>
                    </>
                )}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
