import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../src/components/common';
import { mockTurbines } from '../../src/mocks/data';

// Simulated photo data structure
interface TurbinePhoto {
  id: string;
  url: string;
  timestamp: Date;
  category: 'BLADE' | 'HUB' | 'NACELLE' | 'TOWER';
  notes?: string;
}

const mockPhotos: TurbinePhoto[] = [
  {
    id: '1',
    url: 'https://via.placeholder.com/300',
    timestamp: new Date('2025-05-18T10:30:00'),
    category: 'BLADE',
    notes: 'Inspección de pala 1, sin daños visibles',
  },
  {
    id: '2',
    url: 'https://via.placeholder.com/300',
    timestamp: new Date('2025-05-18T10:35:00'),
    category: 'HUB',
    notes: 'Conexiones del hub en buen estado',
  },
];

const photoCategories = [
  { id: 'BLADE', label: 'Palas', icon: 'straighten' },
  { id: 'HUB', label: 'Hub', icon: 'radio-button-checked' },
  { id: 'NACELLE', label: 'Nacelle', icon: 'home-work' },
  { id: 'TOWER', label: 'Torre', icon: 'architecture' },
];

export default function PhotosScreen() {
  const { turbineId } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const turbine = mockTurbines.find(t => t.id === turbineId);
  const filteredPhotos = selectedCategory
    ? mockPhotos.filter(p => p.category === selectedCategory)
    : mockPhotos;

  const handleUploadPress = () => {
    Alert.alert('Subir Fotos', 'Función de carga de fotos pendiente de implementar');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: turbine ? `Fotos - ${turbine.name}` : 'Galería de Fotos',
          headerStyle: { backgroundColor: '#1a237e' },
          headerTintColor: '#fff',
        }}
      />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          <View style={styles.categories}>
            {photoCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
              >
                <MaterialIcons
                  name={category.icon as any}
                  size={24}
                  color={
                    selectedCategory === category.id ? '#64ffda' : '#8892b0'
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPress}
          >
            <MaterialIcons name="cloud-upload" size={24} color="#0a192f" />
            <Text style={styles.uploadButtonText}>Subir Nuevas Fotos</Text>
          </TouchableOpacity>

          <View style={styles.photoGrid}>
            {filteredPhotos.map(photo => (
              <Card key={photo.id} title={photo.category}>
                <Image
                  source={{ uri: photo.url }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.photoInfo}>
                  <Text style={styles.timestamp}>
                    {new Date(photo.timestamp).toLocaleString()}
                  </Text>
                  {photo.notes && (
                    <Text style={styles.notes}>{photo.notes}</Text>
                  )}
                </View>
              </Card>
            ))}
          </View>

          {filteredPhotos.length === 0 && (
            <Text style={styles.noPhotos}>
              No hay fotos disponibles
              {selectedCategory ? ' para esta categoría' : ''}
            </Text>
          )}
        </ScrollView>
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
  content: {
    padding: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  categoryButtonSelected: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#64ffda',
  },
  categoryText: {
    color: '#8892b0',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#64ffda',
  },
  uploadButton: {
    backgroundColor: '#64ffda',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  uploadButtonText: {
    color: '#0a192f',
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    gap: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoInfo: {
    gap: 4,
  },
  timestamp: {
    color: '#8892b0',
    fontSize: 12,
  },
  notes: {
    color: '#fff',
    fontSize: 14,
  },
  noPhotos: {
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
});