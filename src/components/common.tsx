import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: any;
}

export function Card({ title, children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {React.Children.map(children, child =>
        typeof child === 'string' || typeof child === 'number'
          ? <Text>{child}</Text>
          : child
      )}
    </View>
  );
};

interface StatusBadgeProps {
  status: string;
  color?: string;
}

export const StatusBadge = ({ status, color }: StatusBadgeProps) => {
  return (
    <View style={[styles.badge, { backgroundColor: color || '#64ffda' }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

interface InfoRowProps {
  label: string;
  value: string | number | undefined;
  style?: any;
  iconName?: keyof typeof Ionicons.glyphMap; // Add iconName to props
}

export const InfoRow = ({ label, value, style, iconName }: InfoRowProps) => { // Destructure iconName
  return (
    <View style={[styles.infoRow, style]}>
      <View style={styles.infoLabelContainer}>
        {iconName && <Ionicons name={iconName} size={16} style={styles.infoRow_icon} />}
        <Text style={styles.infoLabel}>{label}:</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b', // Cambiado de blanco a azul oscuro
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#0a192f',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically
    paddingVertical: 6, // Increased padding a bit
  },
  infoLabelContainer: { // New container for label and icon
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow_icon: { // Style for the icon
    marginRight: 6,
    color: '#94a3b8', // Example color, adjust as needed
  },
  infoLabel: {
    color: '#475569', // Darker for better contrast on white
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#1e293b', // Darker for better contrast
    fontSize: 14,
    fontWeight: '500',
  },
});
