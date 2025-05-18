import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Dashboard Admin', headerStyle: { backgroundColor: '#1a237e' }, headerTintColor: '#fff' }} />
      <Text style={styles.title}>Panel de Administración</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/admin/reports')}>
        <Text style={styles.buttonText}>Ir a Reportes</Text>
      </TouchableOpacity>
      {/* Aquí puedes agregar más accesos directos a otras secciones */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#112240',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  buttonText: {
    color: '#64ffda',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
