// app/pilot/dashboard/project-details-card.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de que InfoRow se importe si lo usas
// Asumo que tienes un componente InfoRow similar a este, si no, adapta o elimina.
// const InfoRow = ({ iconName, label, value }) => ( /* ... tu implementación ... */ );

// Definición de la interfaz Activity si no está globalmente disponible
interface Activity {
  id: string;
  name: string;
  // ... más propiedades de Activity
}

// Props esperadas por ProjectDetailsCard
// Hacer las propiedades del objeto `project` opcionales
interface ProjectForCard {
  id?: string;
  name?: string;
  client?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  drone?: string;
  // Añade otras props que realmente use este componente
}

interface ProjectDetailsCardProps {
  project?: ProjectForCard; // Hacer el objeto project opcional
  onNavigateToChecklist: () => void;
  isChecklistDone: boolean;
  ongoingActivity?: Activity | undefined; // Asumo que Activity está definida
}

// --- COMPONENTE AUXILIAR InfoRow (si no lo tienes en otro lado) ---
// Necesitarás un componente como este si lo usas abajo
const InfoRow = ({ iconName, label, value }: { iconName: keyof typeof Ionicons.glyphMap, label: string, value: string | undefined }) => (
    <View style={cardStyles.infoRow_projectDetail}>
      <Ionicons name={iconName} size={16} color={cardStyles.infoRow_icon.color} style={cardStyles.infoRow_icon} />
      <Text style={cardStyles.infoRow_label}>{label}</Text>
      <Text style={cardStyles.infoRow_value} numberOfLines={1} ellipsizeMode="tail">{value || 'N/A'}</Text>
    </View>
  );


const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({
  project,
  onNavigateToChecklist,
  isChecklistDone,
  ongoingActivity,
}) => {
  console.log('ProjectDetailsCard RENDERED. Received project prop:', project);

  // Si el objeto project es undefined, o si project.name es undefined (aunque el fallback debería prevenirlo),
  // muestra un estado de carga o un mensaje.
  if (!project || typeof project.name === 'undefined') {
    console.warn('ProjectDetailsCard: project prop or project.name is undefined. Displaying fallback UI.');
    return (
      <View style={[cardStyles.card_container, cardStyles.loadingContainer]}>
        <Text style={cardStyles.loadingText}>Cargando detalles del proyecto...</Text>
        {/* Podrías poner un ActivityIndicator aquí también */}
      </View>
    );
  }

  return (
    <View style={cardStyles.card_container}>
      <Text style={cardStyles.card_title_large}>Mi Jornada Hoy</Text>
      <View style={cardStyles.projectBrief_container}>
        {/* Usar fallbacks para cada propiedad accedida */}
        <Text style={cardStyles.projectBrief_name}>{project.name || 'Proyecto sin Nombre'}</Text>
        <InfoRow iconName="business-outline" label="Cliente:" value={project.client} />
        <InfoRow iconName="map-outline" label="Parque:" value={project.location?.split(',')[0]} />
        <InfoRow iconName="calendar-outline" label="Fechas:" value={project.startDate && project.endDate ? `${project.startDate.substring(0,10)} - ${project.endDate.substring(0,10)}` : undefined} />
        <InfoRow iconName="airplane-outline" label="Drone:" value={project.drone} />
      </View>
      {!isChecklistDone ? (
        <TouchableOpacity style={cardStyles.primaryButton_generic} onPress={onNavigateToChecklist}>
          <Ionicons name="shield-checkmark-outline" size={20} color="white" style={cardStyles.primaryButton_icon}/>
          <Text style={cardStyles.primaryButton_text}>Iniciar Checklist Prevuelo</Text>
        </TouchableOpacity>
      ) : ongoingActivity ? (
        <View style={cardStyles.statusDisplay_container}>
          <Ionicons name="sync-circle" size={22} color={cardStyles.statusDisplay_iconInProgress.color} />
          <Text style={cardStyles.statusDisplay_text}>En Curso: {ongoingActivity.name || 'Actividad sin nombre'}</Text>
        </View>
      ) : (
        <View style={cardStyles.statusDisplay_container}>
          <Ionicons name="checkmark-circle" size={22} color={cardStyles.statusDisplay_iconCompleted.color} />
          <Text style={cardStyles.statusDisplay_text}>Checklist Completo. Listo para actividad.</Text>
        </View>
      )}
    </View>
  );
};

// Estilos para ProjectDetailsCard (deberían venir de tu archivo de estilos global o definirse aquí)
// Tomados de tu archivo pilot-dashboard-styles.js y adaptados ligeramente
const cardStyles = StyleSheet.create({
  card_container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150, // Para que el loader tenga algo de espacio
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card_title_large: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  projectBrief_container: {
    marginBottom: 16,
  },
  projectBrief_name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow_projectDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, },
  infoRow_icon: { marginRight: 8, color: '#6b7280', }, // Color de ejemplo
  infoRow_label: { fontSize: 14, color: '#4b5563', fontWeight: '500', width: 75, },
  infoRow_value: { fontSize: 14, color: '#1e3a8a', flex: 1, },
  primaryButton_generic: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 8, marginTop: 8,
  },
  primaryButton_icon: { marginRight: 8, },
  primaryButton_text: { color: '#ffffff', fontSize: 16, fontWeight: '600', },
  statusDisplay_container: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 16, borderRadius: 8, marginTop: 8,
    backgroundColor: '#f3f4f6',
  },
  statusDisplay_iconInProgress: { color: '#f59e0b', marginRight: 10, },
  statusDisplay_iconCompleted: { color: '#10b981', marginRight: 10, },
  statusDisplay_text: { fontSize: 15, color: '#374151', fontWeight: '500', },
});

export default ProjectDetailsCard;