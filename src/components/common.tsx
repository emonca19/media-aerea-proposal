import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
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
    color: '#fff',
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
});
