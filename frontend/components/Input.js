import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { styles, COLORS } from '../styles/styles';

const Input = ({ placeholder, secureTextEntry, value, onChangeText, rightIcon, onRightIconPress  }) => (
  <View style={styles.inputContainer}>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      secureTextEntry={secureTextEntry}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
    />
    {rightIcon && (
      <TouchableOpacity onPress={onRightIconPress}>
        <Ionicons name={rightIcon} size={20} color={COLORS.textLight} />
      </TouchableOpacity>
    )}
  </View>
  
);

export default Input;