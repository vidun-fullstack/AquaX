import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from '../styles/styles';

export default function MetricCard({ label, value, iconName, iconColor, bgColor, status }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: bgColor }]}>
        <Feather name={iconName} size={28} color={iconColor} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      
      {/* Renders the Good/Warning status if you want to display it */}
      {status && (
        <Text style={{ 
            color: status === 'Good' ? '#22c55e' : '#ef4444',
            marginTop: 4 
        }}>
          {status}
        </Text>
      )}
    </View>
  );
}