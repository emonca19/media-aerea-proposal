import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <View style={[styles.container, { borderColor: color }]}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64ffda',
    flex: 1,
    minWidth: 120,
  },
  title: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
