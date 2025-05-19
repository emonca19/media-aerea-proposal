import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockProjects } from '../../src/mocks/data';

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const projectId = Array.isArray(id) ? id[0] : id;
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(12,4,67,1)', 'rgba(151,68,195,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Text style={styles.headerButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.errorText}>Proyecto no encontrado</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#4caf50';
      case 'PAUSED': return '#ff9800';
      case 'FINISHED': return '#2196f3';
      case 'COMPLETED': return '#8bc34a';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <LinearGradient
        colors={['rgba(12,4,67,1)', 'rgba(151,68,195,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Text style={styles.headerButtonText}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.logoutButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.headerButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{project.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(project.status) }]} />
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Fechas del Proyecto</Text>
            <Text style={styles.info}>Inicio: {project.startDate.toLocaleDateString()}</Text>
            <Text style={styles.info}>Fin: {project.endDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Descripción</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#64ffda',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    color: '#64ffda',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    color: '#8892b0',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
