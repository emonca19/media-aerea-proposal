import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MyIndicatorsButtonProps {
  onPress: () => void;
}

const MyIndicatorsButton: React.FC<MyIndicatorsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.secondaryButton_generic} onPress={onPress}>
      <Ionicons name="stats-chart-outline" size={20} color={styles.secondaryButton_icon.color} style={styles.secondaryButton_icon} />
      <Text style={styles.secondaryButton_text}>Consultar Mis Indicadores</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  secondaryButton_generic: {
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  secondaryButton_text: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton_icon: {
    marginRight: 8,
    color: '#3b82f6',
  },
});

export default MyIndicatorsButton;
