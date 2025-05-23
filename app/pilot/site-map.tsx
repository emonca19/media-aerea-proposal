import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Datos de ejemplo para el mapa del sitio
const siteData = {
  name: 'Parque Eólico San Matías',
  location: 'Tamaulipas, México',
  description: 'Parque eólico con 25 turbinas de generación distribuidas en un área de 450 hectáreas.',
  coordinates: '25.8573° N, 97.5035° W',
  totalTurbines: 25,
  operationalTurbines: 22,
  maintenanceTurbines: 2,
  offlineTurbines: 1,
};

// Datos simulados de turbinas
const turbines = [
  { id: 'T001', name: 'WTG-001', status: 'operational', lat: 131, lng: 124 },
  { id: 'T002', name: 'WTG-002', status: 'operational', lat: 165, lng: 148 },
  { id: 'T003', name: 'WTG-003', status: 'maintenance', lat: 204, lng: 172 },
  { id: 'T004', name: 'WTG-004', status: 'operational', lat: 238, lng: 201 },
  { id: 'T005', name: 'WTG-005', status: 'operational', lat: 270, lng: 223 },
  { id: 'T006', name: 'WTG-006', status: 'operational', lat: 154, lng: 196 },
  { id: 'T007', name: 'WTG-007', status: 'operational', lat: 187, lng: 218 },
  { id: 'T008', name: 'WTG-008', status: 'operational', lat: 220, lng: 243 },
  { id: 'T009', name: 'WTG-009', status: 'offline', lat: 251, lng: 268 },
  { id: 'T010', name: 'WTG-010', status: 'operational', lat: 283, lng: 293 },
  { id: 'T011', name: 'WTG-011', status: 'operational', lat: 119, lng: 232 },
  { id: 'T012', name: 'WTG-012', status: 'operational', lat: 168, lng: 268 },
  { id: 'T013', name: 'WTG-013', status: 'operational', lat: 192, lng: 292 },
  { id: 'T014', name: 'WTG-014', status: 'operational', lat: 239, lng: 324 },
  { id: 'T015', name: 'WTG-015', status: 'operational', lat: 276, lng: 347 },
  { id: 'T016', name: 'WTG-016', status: 'operational', lat: 134, lng: 297 },
  { id: 'T017', name: 'WTG-017', status: 'maintenance', lat: 169, lng: 328 },
  { id: 'T018', name: 'WTG-018', status: 'operational', lat: 206, lng: 359 },
  { id: 'T019', name: 'WTG-019', status: 'operational', lat: 242, lng: 388 },
  { id: 'T020', name: 'WTG-020', status: 'operational', lat: 275, lng: 415 },
];

// Ubicaciones de drones activos
const drones = [
  { id: 'D001', name: 'DJI M300 #1', status: 'active', lat: 220, lng: 280 },
];

// Establecimientos relevantes
const facilities = [
  { id: 'F001', name: 'Centro de Control', type: 'control', lat: 190, lng: 120 },
  { id: 'F002', name: 'Almacén', type: 'storage', lat: 220, lng: 140 },
  { id: 'F003', name: 'Estación Meteorológica', type: 'weather', lat: 250, lng: 160 },
];

// Rutas y caminos
const roads = [
  { id: 'R001', name: 'Camino Principal', points: [
    {lat: 100, lng: 100}, {lat: 300, lng: 100}, {lat: 300, lng: 450}, {lat: 100, lng: 450}, {lat: 100, lng: 100}
  ]},
  { id: 'R002', name: 'Acceso Norte', points: [
    {lat: 190, lng: 100}, {lat: 190, lng: 200}
  ]},
  { id: 'R003', name: 'Acceso Este', points: [
    {lat: 300, lng: 280}, {lat: 200, lng: 280}
  ]},
];

const statusColors = {
  operational: '#10b981', // verde esmeralda
  maintenance: '#f59e0b', // ámbar
  offline: '#ef4444',    // rojo
  active: '#3b82f6',     // azul
};

const getStatusColor = (status: string) => {
  return statusColors[status as keyof typeof statusColors] || '#9ca3af';
};

const getMarkerIcon = (type: string) => {
  switch (type) {
    case 'operational': return 'ellipse';
    case 'maintenance': return 'construct-outline';
    case 'offline': return 'alert-circle-outline';
    case 'active': return 'navigate-circle-outline';
    case 'control': return 'business-outline';
    case 'storage': return 'cube-outline';
    case 'weather': return 'cloudy-outline';
    default: return 'location-outline';
  }
};

export default function SiteMapScreen() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  const mapRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const filterMenuAnim = useRef(new Animated.Value(0)).current;
  const legendMenuAnim = useRef(new Animated.Value(0)).current;
  
  // Animación pulsante para drones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animación para la entrada inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
    
    // Animación pulsante continua para drones
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [fadeAnim, pulseAnim]);
  
  // Animación para el menú de filtros
  useEffect(() => {
    Animated.timing(filterMenuAnim, {
      toValue: filterMenuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [filterMenuOpen, filterMenuAnim]);
  
  // Animación para el menú de leyenda
  useEffect(() => {
    Animated.timing(legendMenuAnim, {
      toValue: isLegendVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [isLegendVisible, legendMenuAnim]);
  
  const handleStartDrag = (event: any) => {
    setIsDragging(true);
    setDragStart({
      x: event.nativeEvent.pageX - mapOffset.x,
      y: event.nativeEvent.pageY - mapOffset.y
    });
  };
  
  const handleDrag = (event: any) => {
    if (isDragging) {
      setMapOffset({
        x: event.nativeEvent.pageX - dragStart.x,
        y: event.nativeEvent.pageY - dragStart.y
      });
    }
  };
    const handleEndDrag = () => {
    setIsDragging(false);
  };
  
  const handleZoomIn = () => {
    setMapScale(prev => Math.min(prev + 0.2, 2.5));
  };
  
  const handleZoomOut = () => {
    setMapScale(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleResetMapView = () => {
    setMapScale(1);
    setMapOffset({ x: 0, y: 0 });
    
    // Animación suave al resetear
    Animated.parallel([
      Animated.timing(new Animated.Value(mapScale), {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(new Animated.Value(mapOffset.x), {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(new Animated.Value(mapOffset.y), {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const handleFilterChange = (filter: string) => {
    if (selectedFilter === filter) {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(filter);
    }
    // Cerrar el menú de filtros después de seleccionar
    setFilterMenuOpen(false);
  };
  
  const filteredTurbines = selectedFilter 
    ? turbines.filter(t => t.status === selectedFilter)
    : turbines;
    
  const filteredFacilities = selectedFilter === 'facilities' 
    ? facilities 
    : selectedFilter ? [] : facilities;
    
  const filteredDrones = selectedFilter === 'drones' || !selectedFilter
    ? drones
    : [];
  
  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };
  
  const toggleFilterMenu = () => {
    setFilterMenuOpen(!filterMenuOpen);
  };
    // Simula un mapa con elementos posicionados con coordenadas relativas
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Encabezado con título y botón de retroceso */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Sitio</Text>
        
        {/* Controles de filtro y leyenda */}
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={[styles.headerControlButton, filterMenuOpen && styles.headerControlButtonActive]} 
            onPress={toggleFilterMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={22} color={filterMenuOpen ? "#ffffff" : "#1e3a8a"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerControlButton, isLegendVisible && styles.headerControlButtonActive]} 
            onPress={toggleLegend}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle" size={22} color={isLegendVisible ? "#ffffff" : "#1e3a8a"} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Información del sitio */}
      <Animated.View 
        style={[
          styles.siteInfoContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.siteName}>{siteData.name}</Text>
        <Text style={styles.siteLocation}>{siteData.location}</Text>
        
        <View style={styles.statusSummary}>
          <TouchableOpacity 
            style={[
              styles.statusItem, 
              selectedFilter === 'operational' && styles.statusItemSelected
            ]}
            onPress={() => handleFilterChange('operational')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.operational }]} />
            <Text style={styles.statusText}>Operativas: {siteData.operationalTurbines}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusItem, 
              selectedFilter === 'maintenance' && styles.statusItemSelected
            ]}
            onPress={() => handleFilterChange('maintenance')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.maintenance }]} />
            <Text style={styles.statusText}>En Mantenimiento: {siteData.maintenanceTurbines}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusItem, 
              selectedFilter === 'offline' && styles.statusItemSelected
            ]}
            onPress={() => handleFilterChange('offline')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.offline }]} />
            <Text style={styles.statusText}>Fuera de Servicio: {siteData.offlineTurbines}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Menú desplegable de filtros */}
      <Animated.View 
        style={[
          styles.filterMenu,
          {
            opacity: filterMenuAnim,
            transform: [{ 
              translateY: filterMenuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              }) 
            }]
          },
          !filterMenuOpen && { height: 0, overflow: 'hidden' }
        ]}
      >
        <View style={styles.filterOptions}>
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === null && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('')}
            activeOpacity={0.7}
          >
            <Ionicons name="apps" size={18} color={selectedFilter === null ? "#ffffff" : "#1e3a8a"} />
            <Text style={[styles.filterOptionText, selectedFilter === null && styles.filterOptionTextSelected]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === 'operational' && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('operational')}
            activeOpacity={0.7}
          >
            <View style={[styles.miniStatusDot, { backgroundColor: statusColors.operational }]} />
            <Text style={[styles.filterOptionText, selectedFilter === 'operational' && styles.filterOptionTextSelected]}>
              Operativas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === 'maintenance' && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('maintenance')}
            activeOpacity={0.7}
          >
            <View style={[styles.miniStatusDot, { backgroundColor: statusColors.maintenance }]} />
            <Text style={[styles.filterOptionText, selectedFilter === 'maintenance' && styles.filterOptionTextSelected]}>
              Mantenimiento
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === 'offline' && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('offline')}
            activeOpacity={0.7}
          >
            <View style={[styles.miniStatusDot, { backgroundColor: statusColors.offline }]} />
            <Text style={[styles.filterOptionText, selectedFilter === 'offline' && styles.filterOptionTextSelected]}>
              Fuera de Servicio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === 'drones' && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('drones')}
            activeOpacity={0.7}
          >
            <View style={[styles.miniStatusDot, { backgroundColor: statusColors.active }]} />
            <Text style={[styles.filterOptionText, selectedFilter === 'drones' && styles.filterOptionTextSelected]}>
              Drones
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterOption, selectedFilter === 'facilities' && styles.filterOptionSelected]} 
            onPress={() => handleFilterChange('facilities')}
            activeOpacity={0.7}
          >
            <Ionicons name="business" size={16} color={selectedFilter === 'facilities' ? "#ffffff" : "#1e3a8a"} />
            <Text style={[styles.filterOptionText, selectedFilter === 'facilities' && styles.filterOptionTextSelected]}>
              Instalaciones
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Leyenda del mapa */}
      <Animated.View 
        style={[
          styles.legendContainer,
          {
            opacity: legendMenuAnim,
            transform: [{ 
              translateY: legendMenuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              }) 
            }]
          },
          !isLegendVisible && { height: 0, overflow: 'hidden' }
        ]}
      >
        <Text style={styles.legendTitle}>Leyenda</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: statusColors.operational }]} />
            <Text style={styles.legendText}>Turbina Operativa</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: statusColors.maintenance }]} />
            <Text style={styles.legendText}>Turbina en Mantenimiento</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: statusColors.offline }]} />
            <Text style={styles.legendText}>Turbina Fuera de Servicio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: statusColors.active }]} />
            <Text style={styles.legendText}>Drone Activo</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="business-outline" size={16} color="#6366f1" style={styles.legendIconSpecial} />
            <Text style={styles.legendText}>Instalación</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendRoad]} />
            <Text style={styles.legendText}>Camino</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Contenedor del mapa */}
      <View style={styles.mapContainer}>
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton} 
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#3b82f6" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapControlButton} 
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={24} color="#3b82f6" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapControlButton} 
            onPress={handleResetMapView}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        {/* Mensaje indicativo de filtro activo */}
        {selectedFilter && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterIndicatorText}>
              Filtro activo: {
                selectedFilter === 'operational' ? 'Turbinas Operativas' :
                selectedFilter === 'maintenance' ? 'Turbinas en Mantenimiento' :
                selectedFilter === 'offline' ? 'Turbinas Fuera de Servicio' :
                selectedFilter === 'drones' ? 'Drones' :
                selectedFilter === 'facilities' ? 'Instalaciones' : ''
              }
            </Text>
            <TouchableOpacity 
              onPress={() => setSelectedFilter(null)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
        
        <ScrollView 
          ref={mapRef}
          style={styles.mapScrollView}
          contentContainerStyle={styles.mapScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          maximumZoomScale={2}
          minimumZoomScale={0.5}
        >
          {/* Mapa base (Simulado con un fondo) */}
          <View 
            style={[
              styles.mapBase,
              {
                transform: [{ scale: mapScale }],
                left: mapOffset.x,
                top: mapOffset.y,
              }
            ]}
            onTouchStart={handleStartDrag}
            onTouchMove={handleDrag}
            onTouchEnd={handleEndDrag}
          >
            {/* Fondo del mapa (simulado) */}
            <View style={styles.mapBackground} />
            
            {/* Rutas y caminos (líneas) */}
            {roads.map(road => (
              <View key={road.id} style={styles.roadContainer}>
                {road.points.map((point, index) => {
                  if (index < road.points.length - 1) {
                    const nextPoint = road.points[index + 1];
                    const length = Math.sqrt(
                      Math.pow(nextPoint.lat - point.lat, 2) + 
                      Math.pow(nextPoint.lng - point.lng, 2)
                    );
                    const angle = Math.atan2(
                      nextPoint.lng - point.lng,
                      nextPoint.lat - point.lat
                    ) * 180 / Math.PI;
                    
                    return (
                      <View 
                        key={`road-segment-${index}`}
                        style={[
                          styles.roadSegment,
                          {
                            width: length,
                            left: point.lat,
                            top: point.lng,
                            transform: [{ rotate: `${angle}deg` }],
                          }
                        ]}
                      />
                    );
                  }
                  return null;
                })}
              </View>
            ))}
            
            {/* Instalaciones */}
            {(selectedFilter === 'facilities' || !selectedFilter) && facilities.map(facility => (
              <TouchableOpacity
                key={facility.id}
                style={[
                  styles.mapMarker,
                  { left: facility.lat, top: facility.lng }
                ]}
                onPress={() => setSelectedItem(facility)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={getMarkerIcon(facility.type) as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color="#6366f1" 
                />
                <Text style={styles.markerLabel}>{facility.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Turbinas */}
            {filteredTurbines.map(turbine => (
              <TouchableOpacity
                key={turbine.id}
                style={[
                  styles.mapMarker,
                  { left: turbine.lat, top: turbine.lng }
                ]}
                onPress={() => setSelectedItem(turbine)}
                activeOpacity={0.7}
              >                <Animated.View 
                  style={[
                    styles.markerDot,
                    { backgroundColor: getStatusColor(turbine.status) }
                  ]}
                />
                <Text style={styles.markerLabel}>{turbine.name}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Drones */}
            {(selectedFilter === 'drones' || !selectedFilter) && drones.map(drone => (
              <TouchableOpacity
                key={drone.id}
                style={[
                  styles.mapMarker,
                  { left: drone.lat, top: drone.lng }
                ]}
                onPress={() => setSelectedItem(drone)}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.dronePulse,
                    { 
                      borderColor: '#3b82f6',
                      transform: [{ scale: pulseAnim }] 
                    }
                  ]}
                />
                <Ionicons 
                  name="navigate-circle" 
                  size={22} 
                  color="#3b82f6" 
                />
                <Text style={styles.markerLabel}>{drone.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Panel de detalle del elemento seleccionado */}
      {selectedItem && (
        <Animated.View 
          style={[
            styles.itemDetailCard,
            { 
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.itemDetailHeader}>
            <View style={styles.itemTypeIndicator}>
              <Ionicons 
                name={getMarkerIcon(selectedItem.status || selectedItem.type) as keyof typeof Ionicons.glyphMap} 
                size={24} 
                color={getStatusColor(selectedItem.status) || '#6366f1'} 
              />
            </View>
            <Text style={styles.itemDetailName}>{selectedItem.name}</Text>
            <TouchableOpacity 
              onPress={() => setSelectedItem(null)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemDetailContent}>
            <View style={styles.itemDetailInfo}>
              <Text style={styles.itemDetailStatus}>
                Estado: <Text style={{ color: getStatusColor(selectedItem.status) || '#6366f1', fontWeight: '600' }}>
                  {selectedItem.status ? selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1) : 'N/A'}
                </Text>
              </Text>
              <Text style={styles.itemDetailLocation}>
                Coordenadas: {selectedItem.lat}, {selectedItem.lng}
              </Text>
            </View>
            
            <View style={styles.itemDetailActions}>
              <TouchableOpacity 
                style={styles.itemDetailButton}
                onPress={() => {
                  alert(`Ver detalles de ${selectedItem.name}`);
                  setSelectedItem(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.itemDetailButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
              
              {selectedItem.status && (
                <TouchableOpacity 
                  style={[styles.itemDetailButton, styles.itemDetailSecondaryButton]}
                  onPress={() => {
                    router.push("/pilot/new-incident");
                    setSelectedItem(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemDetailButtonText, styles.itemDetailSecondaryButtonText]}>
                    Reportar Incidente
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerControls: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  headerControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerControlButtonActive: {
    backgroundColor: '#3b82f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 16,
  },
  siteInfoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  siteLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
  },
  filterMenu: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#1e3a8a',
    marginLeft: 4,
  },
  filterOptionTextSelected: {
    color: '#ffffff',
  },
  miniStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendIconSpecial: {
    marginRight: 8,
  },
  legendRoad: {
    width: 20,
    height: 3,
    backgroundColor: '#d1d5db',
    borderRadius: 1.5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIndicatorText: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  mapScrollView: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
  },
  mapBase: {
    position: 'relative',
    width: 600,
    height: 600,
  },
  mapBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  roadContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  roadSegment: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#d1d5db',
    transformOrigin: 'left center',
    borderRadius: 2,
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
  },  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  dronePulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.5,
  },
  markerLabel: {
    fontSize: 10,
    color: '#1e3a8a',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 2,
  },
  itemDetailCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  itemDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    flex: 1,
    marginHorizontal: 12,
  },
  itemDetailContent: {
    marginTop: 8,
  },
  itemDetailInfo: {
    marginBottom: 16,
  },
  itemDetailStatus: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  itemDetailLocation: {
    fontSize: 12,
    color: '#94a3b8',
  },
  itemDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetailButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  itemDetailSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginRight: 0,
    marginLeft: 8,
  },
  itemDetailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  itemDetailSecondaryButtonText: {
    color: '#3b82f6',
  },
});
