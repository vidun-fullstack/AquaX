import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/styles';

const Button = ({ children, onPress, variant = 'primary', style, disabled }) => {
  const getStyle = () => {
    switch(variant) {
      case 'outline':
        return styles.btnOutline;
      case 'ghost':
        return styles.btnGhost;
      case 'danger':
        return styles.btnDanger;
      case 'secondary':
        return styles.btnSecondary;
      default:
        return styles.btnPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btnBase, getStyle(), disabled && styles.btnDisabled, style]}
      disabled={disabled}
    >
      <Text style={styles.btnText}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;