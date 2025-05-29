import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, GestureResponderEvent, Modal, PanResponder, PanResponderGestureState, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface Turbine { id: string; name: string; position: { x: number; y: number }; status: 'operational' | 'maintenance' | 'offline'; power: number; efficiency: number; lastMaintenance: string; nextMaintenance: string; details: { model: string; capacity: number; height: number; bladeLength: number; }; }
interface Drone { id: string; name: string; position: { x: number; y: number }; status: 'active' | 'inactive' | 'charging'; battery: number; currentMission: string | null; details: { model: string; maxFlightTime: number; camera: string; sensors: string[]; }; }
interface Facility { id: string; name: string; position: { x: number; y: number }; type: 'control_center' | 'maintenance' | 'storage'; }

interface DistancePoint { x: number; y: number; } 

const BASE_MAP_WIDTH = 480;
const BASE_MAP_HEIGHT = 480;
const METERS_PER_BASE_PIXEL = 1; 

const styles = StyleSheet.create({  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  siteInfoCard: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 12, marginBottom: 12, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  siteInfoContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  siteInfoTextContainer: { flex: 1, marginRight: 12 },
  siteName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  siteLocation: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  statusCount: { fontSize: 14, fontWeight: '600', color: '#374151' },
  controlsContainer: { paddingHorizontal: 8, paddingBottom: 8, marginBottom: 4 },
  controlsScrollContent: { alignItems: 'center', paddingVertical: 4 },
  controlOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 44,
  },  controlOptionActive: { 
    backgroundColor: '#aa74f0', 
    borderColor: '#8b5cf6',
    shadowColor: '#aa74f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  controlOptionText: { 
    fontSize: 13, 
    color: '#4b5563', 
    marginLeft: 8, 
    fontWeight: '600' 
  },
  controlOptionTextActive: { color: '#ffffff' },
  controlsDivider: { 
    width: 2, 
    height: 32, 
    backgroundColor: '#d1d5db', 
    marginHorizontal: 12,
    borderRadius: 1,
  },
  filterDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  mapContainer: { flex: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 24, backgroundColor: '#f3e8ff', overflow: 'hidden', position: 'relative', borderWidth: 2, borderColor: '#d8b4fe', shadowColor: '#aa74f0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  
  mapBase: { 
    width: BASE_MAP_WIDTH,
    height: BASE_MAP_HEIGHT,
    position: 'relative',
    backgroundColor: '#f3e8ff',
  },
  mapBackground: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  satelliteBackground: { backgroundColor: '#e9d5ff' },
  hybridBackground: { backgroundColor: '#f3e8ff' },
  terrainLine: { position: 'absolute', left: '-50%', top: '-50%', right: '-50%', bottom: '-50%', width: '200%', height: '200%', borderWidth: 0.5, borderColor: 'rgba(165, 180, 252, 0.15)', opacity: 0.4 },
  parkBoundary: { position: 'absolute', width: BASE_MAP_WIDTH * 0.9, height: BASE_MAP_HEIGHT * 0.8, left: BASE_MAP_WIDTH * 0.05, top: BASE_MAP_HEIGHT * 0.1, borderWidth:  2.5, borderColor: '#c4b5fd', borderStyle: 'dashed', borderRadius: 30, zIndex: 2, opacity: 0.7 },
  parkBoundaryLabel: { position: 'absolute', right: '5%', top: '5%', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 10, color: '#7c3aed', fontWeight: '600', borderWidth: 1, borderColor: '#d8b4fe' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 3 },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(165, 180, 252, 0.3)', opacity: 0.6 },
  mapSectionLabel: { position: 'absolute', backgroundColor: 'rgba(67, 56, 202, 0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, zIndex: 4, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
  mapSectionText: { color: '#7c3aed', fontSize: 11, fontWeight: '600' },
  roadContainer: { position: 'absolute', width: '100%', height: '100%', zIndex: 5 },
  roadSegment: { position: 'absolute', backgroundColor: '#94a3b8', borderRadius: 2.5, transformOrigin: '0 0' },
  roadLabel: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, marginLeft: -25, marginTop: -12, zIndex: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  roadLabelText: { fontSize: 10, color: '#4b5563', fontWeight: '500' },
  facilityZone: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', backgroundColor: 'rgba(99, 102, 241, 0.08)', zIndex: 7 },
  mapMarker: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 10, width: 36, height: 36, marginLeft: -18, marginTop: -18 },
  markerDot: { position: 'absolute', width: 28, height: 28, borderRadius: 14, zIndex: -1 },
  turbineIdLabel: { position: 'absolute', fontSize: 10, fontWeight: 'bold', top: -14, backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  turbineGroupContainer: { position: 'absolute', width: '100%', height: '100%', zIndex: 9 },
  windIndicator: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#c4b5fd', zIndex: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  windArrow: {},
  windSpeedBadge: { position: 'absolute', bottom: -16, backgroundColor: '#aa74f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff' },
  windSpeedText: { fontSize: 10, color: '#ffffff', fontWeight: '600' },
  distanceLine: { position: 'absolute', backgroundColor: '#aa74f0', zIndex: 15, transformOrigin: '0 0' },
  distancePoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#e17728', borderWidth: 1.5, borderColor: '#ffffff', zIndex: 16 },
  distanceLabel: { position: 'absolute', backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#93c5fd', zIndex: 17, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, transform: [{translateX: -20}, {translateY: -15}] },
  distanceLabelText: { fontSize: 11, color: '#aa74f0', fontWeight: '600' },
  floatingLabel: { position: 'absolute', alignItems: 'center', zIndex: 100 },
  floatingLabelText: { backgroundColor: '#1f2937', color: '#ffffff', fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  userLocationMarker: { position: 'absolute', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  userLocationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#aa74f0', borderWidth: 1.5, borderColor: '#ffffff' },
  userLocationRing: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.5)', backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  measuringInstructions: { position: 'absolute', bottom: 20, left: '50%', transform: [{ translateX: -(BASE_MAP_WIDTH * 0.5 * 0.5) }], width: BASE_MAP_WIDTH * 0.5, backgroundColor: 'rgba(31, 41, 55, 0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, zIndex: 15 },
  measuringInstructionsText: { fontSize: 12, color: '#ffffff', textAlign: 'center', fontWeight: '500' },
  itemDetailCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10, zIndex: 50 },
  itemDetailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  itemDetailHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  itemDetailInfo: { marginLeft: 12, flex: 1 },
  itemDetailName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  itemDetailStatus: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  closeButton: { padding: 4 },
  itemDetailContent: { marginBottom: 16 },
  itemDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 4 },
  itemDetailLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  itemDetailValue: { fontSize: 14, color: '#1f2937', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  itemDetailPlaceholder: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 10 },
  itemDetailButton: { backgroundColor: '#aa74f0', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  itemDetailButtonText: { fontSize: 16, color: '#ffffff', fontWeight: '600', marginRight: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  legendModal: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  legendHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  closeButtonModal: { padding: 4 },
  legendTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  legendContentScrollView: { maxHeight: Dimensions.get('window').height * 0.55 },
  legendContent: { paddingBottom: 10 },
  legendSectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendItemText: { fontSize: 14, color: '#4b5563', flex: 1, marginLeft: 0 },
  legendItemCount: { fontSize: 13, fontWeight: '600', color: '#7c3aed', backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, minWidth: 30, textAlign: 'center' },
  legendWindIndicator: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#eff6ff', marginRight: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  legendDotSmall: { width: 10, height: 10, borderRadius: 5, marginRight: 10, borderWidth: 1, borderColor: '#ffffff' },
  legendDistanceLine: { width: 20, height: 3, marginRight: 10, borderRadius: 1.5 },
  zoomControls: { position: 'absolute', bottom: 24, right: 20, zIndex: 40, flexDirection: 'column', gap: 12 },
  zoomButton: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', shadowColor: '#aa74f0', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 7, borderWidth: 1, borderColor: '#dbeafe' },
  scaleIndicator: { position: 'absolute', bottom: 28, left: 20, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, zIndex: 40, borderWidth: 1, borderColor: '#dbeafe', shadowColor: '#aa74f0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 5, minWidth: 120 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  scaleText: { color: '#aa74f0', fontSize: 14, fontWeight: '600' },
  parkNameText: { color: '#4b5563', fontSize: 12, marginLeft: 8, fontWeight: '500', maxWidth: 100, flexShrink: 1 },
  miniMapOutline: { height: 4, backgroundColor: '#dbeafe', borderRadius: 2, width: '100%', position: 'relative' },
  zoomInstructions: { position: 'absolute', bottom: Platform.OS === 'ios' ? 95 : 80, alignSelf: 'center', backgroundColor: 'rgba(170, 116, 240, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, zIndex: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  zoomInstructionsText: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
});


const SiteMap: React.FC = () => {  
  const { turbineId, flowType } = useLocalSearchParams<{
    turbineId?: string;
    flowType?: string;
  }>();
  
  const [selectedItem, setSelectedItem] = useState<Turbine | Drone | Facility | null>(null);
  const [floatingLabel, setFloatingLabel] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'operational' | 'maintenance' | 'offline'>('all');
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'hybrid'>('terrain');
  const [showGrid, setShowGrid] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [currentParkId, setCurrentParkId] = useState<'park1' | 'park2'>('park1');

  const animatedScale = useRef(new Animated.Value(1)).current; 
  const animatedPan = useRef(new Animated.ValueXY({x:0, y:0})).current; 

  const floatingLabelAnim = useRef(new Animated.Value(0)).current;
  const screenDimensions = Dimensions.get('window');
  
  const getPinchDistance = (touches: { pageX: number; pageY: number }[]): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const maxScale = 3;
  const minScale = 0.5;

  const [showWind, setShowWind] = useState(false);
  const [measuringDistance, setMeasuringDistance] = useState(false);
  const [distancePoints, setDistancePoints] = useState<DistancePoint[]>([]); 
  const [distance, setDistance] = useState<number | null>(null);

  const scale = useRef(1).current;
  const pan = useRef({x:0, y:0}).current; 
  const pinchStartScale = useRef(1);
  const pinchStartPan = useRef({x:0, y:0});
  const pinchStartDistance = useRef(0);

  const parkDataDefinition = useMemo(() => ({
    'park1': {
      name: 'Parque Eólico San Matías',
      location: 'Tamaulipas, México',
      coordinates: '25.8573° N, 97.5035° W',
      totalTurbines: 16,
      operationalTurbines: 12,
      maintenanceTurbines: 2,
      offlineTurbines: 1,
      turbines: [
        { id: 'T001', name: 'SM-WTG-01', status: 'operational', position: { x: 120, y: 100 }, power: 2.5, efficiency: 97, lastMaintenance: '2024-01-15', nextMaintenance: '2024-04-15', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T002', name: 'SM-WTG-02', status: 'operational', position: { x: 180, y: 100 }, power: 2.5, efficiency: 95, lastMaintenance: '2024-01-10', nextMaintenance: '2024-04-10', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T003', name: 'SM-WTG-03', status: 'operational', position: { x: 240, y: 100 }, power: 2.4, efficiency: 96, lastMaintenance: '2024-01-05', nextMaintenance: '2024-04-05', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T004', name: 'SM-WTG-04', status: 'operational', position: { x: 300, y: 100 }, power: 2.5, efficiency: 99, lastMaintenance: '2024-01-20', nextMaintenance: '2024-04-20', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T005', name: 'SM-WTG-05', status: 'operational', position: { x: 150, y: 150 }, power: 2.5, efficiency: 98, lastMaintenance: '2024-01-12', nextMaintenance: '2024-04-12', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T006', name: 'SM-WTG-06', status: 'maintenance', position: { x: 210, y: 150 }, power: 0, efficiency: 0, lastMaintenance: '2024-02-01', nextMaintenance: '2024-03-01', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T007', name: 'SM-WTG-07', status: 'operational', position: { x: 270, y: 150 }, power: 2.3, efficiency: 92, lastMaintenance: '2024-01-18', nextMaintenance: '2024-04-18', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T008', name: 'SM-WTG-08', status: 'operational', position: { x: 330, y: 150 }, power: 2.5, efficiency: 97, lastMaintenance: '2024-01-14', nextMaintenance: '2024-04-14', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T009', name: 'SM-WTG-09', status: 'operational', position: { x: 120, y: 200 }, power: 2.2, efficiency: 88, lastMaintenance: '2024-01-25', nextMaintenance: '2024-04-25', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T010', name: 'SM-WTG-10', status: 'offline', position: { x: 180, y: 200 }, power: 0, efficiency: 0, lastMaintenance: '2024-01-05', nextMaintenance: '2024-03-05', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T011', name: 'SM-WTG-11', status: 'operational', position: { x: 240, y: 200 }, power: 2.5, efficiency: 94, lastMaintenance: '2024-01-08', nextMaintenance: '2024-04-08', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T012', name: 'SM-WTG-12', status: 'operational', position: { x: 300, y: 200 }, power: 2.4, efficiency: 93, lastMaintenance: '2024-01-22', nextMaintenance: '2024-04-22', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T013', name: 'SM-WTG-13', status: 'operational', position: { x: 150, y: 250 }, power: 2.5, efficiency: 96, lastMaintenance: '2024-01-19', nextMaintenance: '2024-04-19', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T014', name: 'SM-WTG-14', status: 'maintenance', position: { x: 210, y: 250 }, power: 0, efficiency: 0, lastMaintenance: '2024-02-05', nextMaintenance: '2024-03-05', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T015', name: 'SM-WTG-15', status: 'operational', position: { x: 270, y: 250 }, power: 2.5, efficiency: 99, lastMaintenance: '2024-01-11', nextMaintenance: '2024-04-11', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }},
        { id: 'T016', name: 'SM-WTG-16', status: 'operational', position: { x: 330, y: 250 }, power: 2.4, efficiency: 95, lastMaintenance: '2024-01-30', nextMaintenance: '2024-04-30', details: { model: 'Vestas V150', capacity: 2.5, height: 120, bladeLength: 75 }}
      ],
      drones: [
        { id: 'D001', name: 'DJI Matrice 300 #1', status: 'active', position: { x: 210, y: 180 }, battery: 78, currentMission: 'Inspección T010', details: { model: 'DJI Matrice 300 RTK', maxFlightTime: 55, camera: 'Zenmuse H20T', sensors: ['LiDAR', 'Thermal', 'RGB'] }},
        { id: 'D002', name: 'DJI Matrice 300 #2', status: 'inactive', position: { x: 150, y: 120 }, battery: 95, currentMission: null, details: { model: 'DJI Matrice 300 RTK', maxFlightTime: 55, camera: 'Zenmuse H20T', sensors: ['LiDAR', 'Thermal', 'RGB'] }},
      ],
      facilities: [
        { id: 'F001', name: 'Subestación Principal', type: 'control_center', position: { x: 225, y: 175 }},
        { id: 'F002', name: 'Centro de Control', type: 'control_center', position: { x: 260, y: 175 }},
        { id: 'F003', name: 'Almacén', type: 'storage', position: { x: 225, y: 210 }},
      ],
      roads: [
        { id: 'RSM01', path: [{ x: 60, y: 175 }, { x: 225, y: 175 }, { x: 400, y: 175 }] },
        { id: 'RSM02', path: [{ x: 225, y: 60 }, { x: 225, y: 175 }, { x: 225, y: 300 }] },
        { id: 'RSM03', path: [{ x: 60, y: 100 }, { x: 120, y: 100 }, { x: 180, y: 100 }, { x: 240, y: 100 }, { x: 300, y: 100 }, { x: 360, y: 100 }] },
        { id: 'RSM04', path: [{ x: 60, y: 200 }, { x: 120, y: 200 }, { x: 180, y: 200 }, { x: 240, y: 200 }, { x: 300, y: 200 }, { x: 360, y: 200 }] },
      ],
      windIndicators: [
        { id: 'W001', position: { x: 150, y: 150 }, direction: 45, speed: 15 },
        { id: 'W002', position: { x: 270, y: 150 }, direction: 30, speed: 18 },
        { id: 'W003', position: { x: 240, y: 240 }, direction: 60, speed: 12 },
        { id: 'W004', position: { x: 180, y: 240 }, direction: 90, speed: 20 },
      ],
    },
    'park2': {
      name: 'Parque Eólico La Ventosa',
      location: 'Oaxaca, México',
      coordinates: '16.5584° N, 95.2306° W',
      totalTurbines: 24,
      operationalTurbines: 20,
      maintenanceTurbines: 3,
      offlineTurbines: 1,
      turbines: [
        { id: 'T001', name: 'LV-WTG-01', status: 'operational', position: { x: 100, y: 120 }, power: 2.4, efficiency: 96, lastMaintenance: '2024-01-10', nextMaintenance: '2024-04-10', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T002', name: 'LV-WTG-02', status: 'operational', position: { x: 130, y: 110 }, power: 2.5, efficiency: 98, lastMaintenance: '2024-01-05', nextMaintenance: '2024-04-05', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T003', name: 'LV-WTG-03', status: 'operational', position: { x: 160, y: 105 }, power: 2.4, efficiency: 97, lastMaintenance: '2024-01-08', nextMaintenance: '2024-04-08', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T004', name: 'LV-WTG-04', status: 'maintenance', position: { x: 190, y: 100 }, power: 0, efficiency: 0, lastMaintenance: '2024-02-01', nextMaintenance: '2024-03-01', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T005', name: 'LV-WTG-05', status: 'operational', position: { x: 220, y: 100 }, power: 2.5, efficiency: 99, lastMaintenance: '2024-01-15', nextMaintenance: '2024-04-15', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T006', name: 'LV-WTG-06', status: 'operational', position: { x: 250, y: 105 }, power: 2.4, efficiency: 95, lastMaintenance: '2024-01-12', nextMaintenance: '2024-04-12', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T007', name: 'LV-WTG-07', status: 'operational', position: { x: 280, y: 115 }, power: 2.4, efficiency: 94, lastMaintenance: '2024-01-20', nextMaintenance: '2024-04-20', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T008', name: 'LV-WTG-08', status: 'operational', position: { x: 310, y: 130 }, power: 2.5, efficiency: 97, lastMaintenance: '2024-01-25', nextMaintenance: '2024-04-25', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T009', name: 'LV-WTG-09', status: 'operational', position: { x: 100, y: 180 }, power: 2.3, efficiency: 92, lastMaintenance: '2024-01-22', nextMaintenance: '2024-04-22', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T010', name: 'LV-WTG-10', status: 'operational', position: { x: 130, y: 170 }, power: 2.5, efficiency: 98, lastMaintenance: '2024-01-18', nextMaintenance: '2024-04-18', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T011', name: 'LV-WTG-11', status: 'operational', position: { x: 160, y: 165 }, power: 2.4, efficiency: 96, lastMaintenance: '2024-01-14', nextMaintenance: '2024-04-14', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T012', name: 'LV-WTG-12', status: 'maintenance', position: { x: 190, y: 160 }, power: 0, efficiency: 0, lastMaintenance: '2024-02-05', nextMaintenance: '2024-03-05', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T013', name: 'LV-WTG-13', status: 'operational', position: { x: 220, y: 160 }, power: 2.4, efficiency: 95, lastMaintenance: '2024-01-09', nextMaintenance: '2024-04-09', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T014', name: 'LV-WTG-14', status: 'offline', position: { x: 250, y: 165 }, power: 0, efficiency: 0, lastMaintenance: '2024-01-30', nextMaintenance: '2024-03-15', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T015', name: 'LV-WTG-15', status: 'operational', position: { x: 280, y: 170 }, power: 2.5, efficiency: 99, lastMaintenance: '2024-01-16', nextMaintenance: '2024-04-16', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T016', name: 'LV-WTG-16', status: 'operational', position: { x: 310, y: 180 }, power: 2.4, efficiency: 96, lastMaintenance: '2024-01-28', nextMaintenance: '2024-04-28', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T017', name: 'LV-WTG-17', status: 'operational', position: { x: 100, y: 240 }, power: 2.3, efficiency: 93, lastMaintenance: '2024-01-11', nextMaintenance: '2024-04-11', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T018', name: 'LV-WTG-18', status: 'operational', position: { x: 130, y: 230 }, power: 2.4, efficiency: 94, lastMaintenance: '2024-01-19', nextMaintenance: '2024-04-19', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T019', name: 'LV-WTG-19', status: 'operational', position: { x: 160, y: 225 }, power: 2.5, efficiency: 97, lastMaintenance: '2024-01-23', nextMaintenance: '2024-04-23', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T020', name: 'LV-WTG-20', status: 'operational', position: { x: 190, y: 220 }, power: 2.4, efficiency: 95, lastMaintenance: '2024-01-07', nextMaintenance: '2024-04-07', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T021', name: 'LV-WTG-21', status: 'maintenance', position: { x: 220, y: 220 }, power: 0, efficiency: 0, lastMaintenance: '2024-02-10', nextMaintenance: '2024-03-10', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T022', name: 'LV-WTG-22', status: 'operational', position: { x: 250, y: 225 }, power: 2.5, efficiency: 98, lastMaintenance: '2024-01-13', nextMaintenance: '2024-04-13', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T023', name: 'LV-WTG-23', status: 'operational', position: { x: 280, y: 230 }, power: 2.4, efficiency: 96, lastMaintenance: '2024-01-04', nextMaintenance: '2024-04-04', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }},
        { id: 'T024', name: 'LV-WTG-24', status: 'operational', position: { x: 310, y: 240 }, power: 2.5, efficiency: 99, lastMaintenance: '2024-01-21', nextMaintenance: '2024-04-21', details: { model: 'Gamesa G132', capacity: 2.5, height: 114, bladeLength: 66 }}
      ],
      drones: [
        { id: 'D101', name: 'DJI Matrice 300 #3', status: 'active', position: { x: 190, y: 160 }, battery: 65, currentMission: 'Inspección T012', details: { model: 'DJI Matrice 300 RTK', maxFlightTime: 55, camera: 'Zenmuse H20T', sensors: ['LiDAR', 'Thermal', 'RGB'] }},
        { id: 'D102', name: 'DJI Matrice 300 #4', status: 'inactive', position: { x: 200, y: 120 }, battery: 90, currentMission: null, details: { model: 'DJI Matrice 300 RTK', maxFlightTime: 55, camera: 'Zenmuse H20T', sensors: ['LiDAR', 'Thermal', 'RGB'] }},
        { id: 'D103', name: 'DJI Mavic 3 Enterprise', status: 'charging', position: { x: 240, y: 200 }, battery: 25, currentMission: null, details: { model: 'DJI Mavic 3 Enterprise', maxFlightTime: 45, camera: 'Hasselblad', sensors: ['RGB', 'Thermal'] }}
      ],
      facilities: [
        { id: 'F101', name: 'Centro de Operaciones LV', type: 'control_center', position: { x: 200, y: 190 }},
        { id: 'F102', name: 'Subestación LV', type: 'control_center', position: { x: 240, y: 190 }},
        { id: 'F103', name: 'Almacén de Equipos LV', type: 'storage', position: { x: 200, y: 220 }},
        { id: 'F104', name: 'Taller de Mantenimiento LV', type: 'maintenance', position: { x: 240, y: 220 }}
      ],
      roads: [
        { id: 'RLV01', path: [{ x: 60, y: 190 }, { x: 200, y: 190 }, { x: 350, y: 190 }] },
        { id: 'RLV02', path: [{ x: 80, y: 115 }, { x: 100, y: 120 }, { x: 130, y: 110 }, { x: 160, y: 105 }, { x: 190, y: 100 }, { x: 220, y: 100 }, { x: 250, y: 105 }, { x: 280, y: 115 }, { x: 310, y: 130 }, { x: 330, y: 140 }] },
        { id: 'RLV03', path: [{ x: 80, y: 175 }, { x: 100, y: 180 }, { x: 130, y: 170 }, { x: 160, y: 165 }, { x: 190, y: 160 }, { x: 220, y: 160 }, { x: 250, y: 165 }, { x: 280, y: 170 }, { x: 310, y: 180 }, { x: 330, y: 190 }] },
        { id: 'RLV04', path: [{ x: 80, y: 235 }, { x: 100, y: 240 }, { x: 130, y: 230 }, { x: 160, y: 225 }, { x: 190, y: 220 }, { x: 220, y: 220 }, { x: 250, y: 225 }, { x: 280, y: 230 }, { x: 310, y: 240 }, { x: 330, y: 250 }] },
        { id: 'RLV05', path: [{ x: 200, y: 100 }, { x: 200, y: 160 }, { x: 200, y: 190 }, { x: 200, y: 220 }] },
      ],
      windIndicators: [
        { id: 'W101', position: { x: 160, y: 135 }, direction: 125, speed: 22 },
        { id: 'W102', position: { x: 250, y: 135 }, direction: 110, speed: 25 },
        { id: 'W103', position: { x: 160, y: 195 }, direction: 115, speed: 20 },
        { id: 'W104', position: { x: 250, y: 195 }, direction: 120, speed: 23 }
      ],
    }
  }), []);
  const currentParkData = parkDataDefinition[currentParkId];

  React.useEffect(() => {
    if (turbineId && currentParkData) {
      const targetTurbine = currentParkData.turbines.find(t => t.id === turbineId);
      if (targetTurbine) {
        setSelectedItem(targetTurbine);
      }
    }
  }, [turbineId, currentParkData]);

  if (!currentParkData) {
    return <View style={styles.loadingContainer}><Text>Cargando datos del parque...</Text></View>;
  }

  const {
    name: siteName, 
    location: siteLocation,
    coordinates: siteCoordinates,
    totalTurbines: siteTotalTurbines,
    operationalTurbines: siteOperationalTurbines,
    maintenanceTurbines: siteMaintenanceTurbines,
    offlineTurbines: siteOfflineTurbines,
    turbines,
    drones,
    facilities,
    roads,
    windIndicators
  } = currentParkData;

  const siteData = {
    name: siteName,
    location: siteLocation,
    coordinates: siteCoordinates,
    totalTurbines: siteTotalTurbines,
    operationalTurbines: siteOperationalTurbines,
    maintenanceTurbines: siteMaintenanceTurbines,
    offlineTurbines: siteOfflineTurbines,
  };

  const animateScaleAndPan = useCallback((targetScale: number, panTo?: {x: number, y: number}) => {
    const clampedScale = Math.min(Math.max(targetScale, minScale), maxScale);

    scale.current = clampedScale;

    Animated.parallel([
        Animated.spring(animatedScale, {
            toValue: clampedScale,
            useNativeDriver: true,
            friction: 10,
            tension: 60,
        }),
        panTo ? Animated.spring(animatedPan, {
            toValue: panTo,
            useNativeDriver: true, 
            friction: 10,
            tension: 60,
        }) : Animated.timing(animatedPan, {
            toValue: {x: pan.x, y: pan.y},
            duration: 0,
            useNativeDriver: true,
        })
    ]).start();
  }, [animatedScale, animatedPan, pan]);


  const zoomIn = useCallback((screenTargetX?: number, screenTargetY?: number) => {
    const currentAnimatedScale = animatedScale.__getValue();
    const targetScale = Math.min(currentAnimatedScale * 1.25, maxScale);
    
    const sX = screenTargetX ?? screenDimensions.width / 2;
    const sY = screenTargetY ?? (screenDimensions.height - styles.header.paddingTop - styles.header.paddingBottom - (styles.siteInfoCard.height ?? 100) - (styles.controlsContainer.height ?? 50) ) / 2 + styles.header.paddingTop + (styles.siteInfoCard.height ?? 100) + (styles.controlsContainer.height ?? 50); 


    const currentPanX = animatedPan.x.__getValue();
    const currentPanY = animatedPan.y.__getValue();

    const mapPointX = (sX - currentPanX) / currentAnimatedScale;
    const mapPointY = (sY - currentPanY) / currentAnimatedScale;

    const newPanX = sX - mapPointX * targetScale;
    const newPanY = sY - mapPointY * targetScale;
    
    const maxPanX = 0;
    const minPanX = screenDimensions.width - BASE_MAP_WIDTH * targetScale;
    const maxPanY = 0; 
    const minPanY = screenDimensions.height - BASE_MAP_HEIGHT * targetScale - (Platform.OS === 'android' ? 150 : 200) ; 

    const clampedPanX = Math.min(maxPanX, Math.max(minPanX, newPanX));
    const clampedPanY = Math.min(maxPanY, Math.max(minPanY, newPanY));

    pan.x = clampedPanX; 
    pan.y = clampedPanY;

    animateScaleAndPan(targetScale, { x: clampedPanX, y: clampedPanY });
  }, [animatedScale, animatedPan, screenDimensions, pan, animateScaleAndPan]);

  const zoomOut = useCallback((screenTargetX?: number, screenTargetY?: number) => {
    const currentAnimatedScale = animatedScale.__getValue();
    const targetScale = Math.max(currentAnimatedScale * 0.8, minScale);

    const sX = screenTargetX ?? screenDimensions.width / 2;
    const sY = screenTargetY ?? (screenDimensions.height - styles.header.paddingTop - styles.header.paddingBottom - (styles.siteInfoCard.height ?? 100) - (styles.controlsContainer.height ?? 50) ) / 2 + styles.header.paddingTop + (styles.siteInfoCard.height ?? 100) + (styles.controlsContainer.height ?? 50);

    const currentPanX = animatedPan.x.__getValue();
    const currentPanY = animatedPan.y.__getValue();

    const mapPointX = (sX - currentPanX) / currentAnimatedScale;
    const mapPointY = (sY - currentPanY) / currentAnimatedScale;

    const newPanX = sX - mapPointX * targetScale;
    const newPanY = sY - mapPointY * targetScale;

    const maxPanX = 0;
    const minPanX = screenDimensions.width - BASE_MAP_WIDTH * targetScale;
    const maxPanY = 0;
    const minPanY = screenDimensions.height - BASE_MAP_HEIGHT * targetScale - (Platform.OS === 'android' ? 150 : 200);

    const clampedPanX = Math.min(maxPanX, Math.max(minPanX, newPanX));
    const clampedPanY = Math.min(maxPanY, Math.max(minPanY, newPanY));
    
    pan.x = clampedPanX;
    pan.y = clampedPanY;

    animateScaleAndPan(targetScale, { x: clampedPanX, y: clampedPanY });
  }, [animatedScale, animatedPan, screenDimensions, pan, animateScaleAndPan]);


  const { panHandlers } = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => true,

      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          pinchStartDistance.current = getPinchDistance(evt.nativeEvent.touches);
          pinchStartScale.current = animatedScale.__getValue();
        } else if (gestureState.numberActiveTouches === 1) {
          pinchStartPan.current = { x: animatedPan.x._value, y: animatedPan.y._value };
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gestureState.numberActiveTouches === 2 && pinchStartDistance.current > 0) {
          const currentPinchDistance = getPinchDistance(evt.nativeEvent.touches);
          if (currentPinchDistance === 0) return;
          let newScale = (currentPinchDistance / pinchStartDistance.current) * pinchStartScale.current;
          newScale = Math.min(Math.max(newScale, minScale), maxScale);
          
         
          scale.current = newScale; 
          animatedScale.setValue(newScale);

          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const sX = (touch1.pageX + touch2.pageX) / 2;
          const sY = (touch2.pageY + touch2.pageY) / 2;

          const mapPointX = (sX - pinchStartPan.current.x) / pinchStartScale.current;
          const mapPointY = (sY - pinchStartPan.current.y) / pinchStartScale.current;

          const newPanX = sX - mapPointX * newScale;
          const newPanY = sY - mapPointY * newScale;
          
          const maxPanX = 0;
          const minPanX = screenDimensions.width - BASE_MAP_WIDTH * newScale;
          const maxPanY = 0;
          const minPanY = screenDimensions.height - BASE_MAP_HEIGHT * newScale - (Platform.OS === 'android' ? 150 : 200);


          const clampedPanX = Math.min(maxPanX, Math.max(minPanX, newPanX));
          const clampedPanY = Math.min(maxPanY, Math.max(minPanY, newPanY));
          
          pan.x = clampedPanX;
          pan.y = clampedPanY;
          animatedPan.setValue({ x: clampedPanX, y: clampedPanY });


        } else if (gestureState.numberActiveTouches === 1) { 
          let newPanX = pinchStartPan.current.x + gestureState.dx;
          let newPanY = pinchStartPan.current.y + gestureState.dy;
          
          const currentAnimatedScale = animatedScale.__getValue();
          const maxPanX = 0;
          const minPanX = screenDimensions.width - BASE_MAP_WIDTH * currentAnimatedScale;
          const maxPanY = 0; 
          const minPanY = screenDimensions.height - BASE_MAP_HEIGHT * currentAnimatedScale - (Platform.OS === 'android' ? 150 : 200);


          newPanX = Math.min(maxPanX, Math.max(minPanX, newPanX));
          newPanY = Math.min(maxPanY, Math.max(minPanY, newPanY));
          
          pan.x = newPanX;
          pan.y = newPanY;
          animatedPan.setValue({ x: newPanX, y: newPanY });
        }
      },
      onPanResponderRelease: () => {
        pinchStartDistance.current = 0;
      },
      onPanResponderTerminate: () => {
        pinchStartDistance.current = 0;
      }
    })
  ).current;


  const togglePark = useCallback(() => {
    setCurrentParkId(prev => prev === 'park1' ? 'park2' : 'park1');
    scale.current = 1;
    animatedScale.setValue(1);
    pan.x = 0; pan.y = 0;
    animatedPan.setValue({x:0, y:0});

    setSelectedItem(null);
    setDistancePoints([]);
    setDistance(null);
  }, [animatedScale, animatedPan, pan]);


  const getFilteredTurbines = useCallback(() => {
    if (!turbines) return [];
    if (filterType === 'all') return turbines;
    return turbines.filter(turbine => turbine.status === filterType);
  }, [filterType, turbines]);

  const centerOnUserLocation = useCallback(() => {
    setUserLocation({ x: BASE_MAP_WIDTH / 2, y: BASE_MAP_HEIGHT / 2 });
    const targetScale = animatedScale.__getValue();
    const targetPanX = screenDimensions.width / 2 - (BASE_MAP_WIDTH / 2) * targetScale;
    const targetPanY = (screenDimensions.height / 2 - (BASE_MAP_HEIGHT / 2) * targetScale) - 50 ; 
    
    pan.x = targetPanX; pan.y = targetPanY;
    animateScaleAndPan(targetScale, { x: targetPanX, y: targetPanY });

}, [animatedScale, screenDimensions, pan, animateScaleAndPan]);


  const handleMapClick = useCallback((event: GestureResponderEvent) => {
    if (!measuringDistance) return;
    const { locationX, locationY } = event.nativeEvent; 
    const currentAnimatedScale = animatedScale.__getValue();
    const currentPanX = animatedPan.x.__getValue();
    const currentPanY = animatedPan.y.__getValue();

    const baseMapX = (locationX - currentPanX) / currentAnimatedScale;
    const baseMapY = (locationY - currentPanY) / currentAnimatedScale;


    if (distancePoints.length < 2) {
        const newPoints = [...distancePoints, { x: baseMapX, y: baseMapY }];
        setDistancePoints(newPoints);

        if (newPoints.length === 2) {
            const start = newPoints[0]; 
            const end = newPoints[1];
            const basePixelDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            const distanceInMeters = basePixelDistance * METERS_PER_BASE_PIXEL;
            setDistance(distanceInMeters);
        }
    } else {
        setDistancePoints([{ x: baseMapX, y: baseMapY }]);
        setDistance(null);
    }
  }, [measuringDistance, distancePoints, animatedScale, animatedPan]);


  const toggleDistanceMeasurement = useCallback(() => {
    setMeasuringDistance(prev => {
      if (prev) {
        setDistancePoints([]);
        setDistance(null);
      }
      return !prev;
    });
  }, []);

  const toggleWindIndicators = useCallback(() => setShowWind(prev => !prev), []);

  const getVisualElementScale = useCallback(() => {
    const currentAnimatedScale = animatedScale.__getValue();
    return Math.min(1.2, Math.max(0.7, 1 / Math.pow(currentAnimatedScale, 0.4)));
  }, [animatedScale]);
  const statusColors = useMemo(() => ({
    operational: '#10b981',
    maintenance: '#f59e0b',
    offline: '#e17728',
    active: '#aa74f0',
    inactive: '#6b7280',
    charging: '#8b5cf6',
    control_center: '#6366f1',
    storage: '#a855f7',
  }), []);
  
  const facilityIconColor = useMemo(() => '#4f46e5', []);
  
  const mapViewOptions = useMemo(() => [
    { value: 'terrain' as const, label: 'Terreno', icon: 'earth' as const },
    { value: 'satellite' as const, label: 'Satélite', icon: 'planet' as const },
    { value: 'hybrid' as const, label: 'Híbrido', icon: 'layers' as const }
  ], []);
  
  const filterOptions = useMemo(() => [
    { value: 'all' as const, label: 'Todas', color: '#6b7280' },
    { value: 'operational' as const, label: 'Operativas', color: statusColors.operational },
    { value: 'maintenance' as const, label: 'Mantenimiento', color: statusColors.maintenance },
    { value: 'offline' as const, label: 'Fuera de Servicio', color: statusColors.offline }
  ], [statusColors]);

  const getMarkerIcon = useCallback((statusOrType: string): keyof typeof Ionicons.glyphMap => {
    switch(statusOrType) {
      case 'operational': return 'flash-outline';
      case 'maintenance': return 'build-outline';
      case 'offline': return 'power-outline';
      case 'active': return 'navigate-circle-outline';
      case 'inactive': return 'radio-button-off-outline';
      case 'charging': return 'battery-charging-outline';
      case 'control_center': return 'business-outline';
      case 'storage': return 'cube-outline';
      default: return 'help-circle-outline';
    }
  }, []);

  const getStatusColor = useCallback((statusOrType: string) => {
    return statusColors[statusOrType as keyof typeof statusColors] || '#6b7280';
  }, [statusColors]);

  const showFloatingLabel = useCallback((label: string) => {
    setFloatingLabel(label);
    Animated.timing(floatingLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [floatingLabelAnim]);

  const hideFloatingLabel = useCallback(() => {
    Animated.timing(floatingLabelAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setFloatingLabel(''));
  }, [floatingLabelAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.siteInfoCard}>
        <View style={styles.siteInfoContent}>
          <View style={styles.siteInfoTextContainer}>
            <Text style={styles.siteName}>{siteData.name}</Text>
            <Text style={styles.siteLocation}>{siteData.location}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.operational }]} />
              <Text style={styles.statusCount}>{siteData.operationalTurbines}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.maintenance }]} />
              <Text style={styles.statusCount}>{siteData.maintenanceTurbines}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: statusColors.offline }]} />
              <Text style={styles.statusCount}>{siteData.offlineTurbines}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.controlsScrollContent}
        >
          {mapViewOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[ styles.controlOption, mapView === option.value && styles.controlOptionActive ]}
              onPress={() => setMapView(option.value)}
            >
              <Ionicons name={option.icon} size={18} color={mapView === option.value ? '#ffffff' : '#4b5563'} />
              <Text style={[ styles.controlOptionText, mapView === option.value && styles.controlOptionTextActive ]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.controlsDivider} />
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[ styles.controlOption, filterType === option.value && { backgroundColor: option.color, borderColor: option.color }]}
              onPress={() => setFilterType(option.value)}
            >
              <View style={[styles.filterDot, { backgroundColor: filterType === option.value ? '#fff' : option.color, borderWidth: filterType === option.value ? 0 : 1, borderColor: option.color }]} />
              <Text style={[ styles.controlOptionText, filterType === option.value && { color: '#ffffff' } ]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.controlsDivider} />
          <TouchableOpacity style={[ styles.controlOption, showGrid && styles.controlOptionActive ]} onPress={() => setShowGrid(!showGrid)}>
            <Ionicons name="grid-outline" size={18} color={showGrid ? '#ffffff' : '#4b5563'} />
            <Text style={[ styles.controlOptionText, showGrid && styles.controlOptionTextActive ]}>Cuadrícula</Text>
          </TouchableOpacity>
          <View style={styles.controlsDivider} />
          <TouchableOpacity style={[ styles.controlOption, showWind && styles.controlOptionActive ]} onPress={toggleWindIndicators}>
            <Ionicons name="flag-outline" size={18} color={showWind ? '#ffffff' : '#4b5563'} />
            <Text style={[ styles.controlOptionText, showWind && styles.controlOptionTextActive ]}>Viento</Text>
          </TouchableOpacity>
          <View style={styles.controlsDivider} />
          <TouchableOpacity style={[ styles.controlOption, measuringDistance && styles.controlOptionActive ]} onPress={toggleDistanceMeasurement}>
            <Ionicons name="analytics-outline" size={18} color={measuringDistance ? '#ffffff' : '#4b5563'} />
            <Text style={[ styles.controlOptionText, measuringDistance && styles.controlOptionTextActive ]}>Medir</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.mapContainer} {...panHandlers}>
          <Animated.View
              style={[
              styles.mapBase,
              {
                  transform: [
                      { translateX: animatedPan.x },
                      { translateY: animatedPan.y },
                      { scale: animatedScale },
                  ],
              },
              ]}
          >
              <TouchableOpacity activeOpacity={1} onPress={handleMapClick} style={StyleSheet.absoluteFill}
                  onLongPress={(e) => {
                      if (!measuringDistance) {
                        const { pageX, pageY } = e.nativeEvent; 
                        zoomIn(pageX, pageY);
                      }
                  }}
              >
                  <View style={[
                      styles.mapBackground,
                      mapView === 'satellite' && styles.satelliteBackground,
                      mapView === 'hybrid' && styles.hybridBackground
                  ]}>
                      {mapView === 'terrain' && (
                          <>
                              <View style={[styles.terrainLine, {transform: [{ rotate: '45deg'}]}]} />
                              <View style={[styles.terrainLine, {transform: [{ rotate: '-45deg'}]}]} />
                          </>
                      )}
                  </View>
                  <View style={styles.parkBoundary}>
                      <Text style={[styles.parkBoundaryLabel, { transform: [{ scale: getVisualElementScale() }] }]}>
                          Límite del Parque
                      </Text>
                  </View>
                  {showGrid && (
                      <View style={styles.gridOverlay}>
                      {Array.from({ length: Math.ceil(BASE_MAP_WIDTH / 50) }).map((_, i) => (
                          <View key={`grid-v-${i}`} style={[ styles.gridLine, { left: i * 50, width: 1, height: '100%' } ]} />
                      ))}
                      {Array.from({ length: Math.ceil(BASE_MAP_HEIGHT / 50) }).map((_, i) => (
                          <View key={`grid-h-${i}`} style={[ styles.gridLine, { top: i * 50, height: 1, width: '100%' } ]} />
                      ))}
                      </View>
                  )}
                  <View style={[styles.mapSectionLabel, { left: BASE_MAP_WIDTH * 0.35, top: BASE_MAP_HEIGHT * 0.1 }]}>
                      <Text style={[styles.mapSectionText, { transform: [{ scale: getVisualElementScale() }] }]}>Área Norte</Text>
                  </View>
                  <View style={[styles.mapSectionLabel, { left: BASE_MAP_WIDTH * 0.35, top: BASE_MAP_HEIGHT * 0.65 }]}>
                      <Text style={[styles.mapSectionText, { transform: [{ scale: getVisualElementScale() }] }]}>Área Sur</Text>
                  </View>

                  {roads.map(road => (
                      <View key={road.id} style={styles.roadContainer}>
                      {road.path.map((point, index) => {
                          if (index < road.path.length - 1) {
                          const nextPoint = road.path[index + 1];
                          const length = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
                          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
                          const midX = (point.x + nextPoint.x) / 2;
                          const midY = (point.y + nextPoint.y) / 2;
                          return (
                              <React.Fragment key={`road-segment-${index}-${road.id}`}>
                              <View style={[ styles.roadSegment, { width: length, left: point.x, top: point.y, height: 5 * getVisualElementScale(), transform: [{ rotate: `${angle}deg` }] }]} />
                              {index === 0 && (
                                  <View style={[styles.roadLabel, { left: midX, top: midY }]}>
                                  <Text style={[styles.roadLabelText, { transform: [{ scale: getVisualElementScale() }] }]}>Acceso {road.id.replace('R00', '').replace('RSM', 'SM-').replace('RLV', 'LV-')}</Text>
                                  </View>
                              )}
                              </React.Fragment>
                          );
                          }
                          return null;
                      })}
                      </View>
                  ))}
                  {facilities.map(facility => (
                      <React.Fragment key={facility.id}>
                      <View style={[ styles.facilityZone, { left: facility.position.x - 20, top: facility.position.y - 20, borderColor: getStatusColor(facility.type) }]} />
                      <TouchableOpacity
                          style={[ styles.mapMarker, { left: facility.position.x, top: facility.position.y }]}
                          onPress={() => setSelectedItem(facility)}
                          onPressIn={() => showFloatingLabel(facility.name)}
                          onPressOut={hideFloatingLabel}
                      >
                          <Ionicons name={getMarkerIcon(facility.type)} size={26 * getVisualElementScale()} color={facilityIconColor} />
                      </TouchableOpacity>
                      </React.Fragment>
                  ))}
                  <View style={styles.turbineGroupContainer}>
                      {getFilteredTurbines().map(turbine => (
                      <TouchableOpacity
                          key={turbine.id}
                          style={[ styles.mapMarker, { left: turbine.position.x, top: turbine.position.y }]}
                          onPress={() => setSelectedItem(turbine)}
                          onPressIn={() => showFloatingLabel(turbine.name)}
                          onPressOut={hideFloatingLabel}
                      >
                          <View style={[ styles.markerDot, { backgroundColor: getStatusColor(turbine.status), opacity: 0.25 }]} />
                          <Ionicons name={getMarkerIcon(turbine.status)} size={22 * getVisualElementScale()} color={getStatusColor(turbine.status)} />
                          <Text style={[styles.turbineIdLabel, { color: getStatusColor(turbine.status), transform: [{ scale: getVisualElementScale() }] }]}>{turbine.id.replace('T00', 'T').replace('T0','T').replace('T1','T')}</Text>
                      </TouchableOpacity>
                      ))}
                  </View>
                  {(drones as Drone[]).map((drone) => ( 
                      <TouchableOpacity
                      key={drone.id}
                      style={[ styles.mapMarker, { left: drone.position.x, top: drone.position.y }]}
                      onPress={() => setSelectedItem(drone)}
                      onPressIn={() => showFloatingLabel(drone.name)}
                      onPressOut={hideFloatingLabel}
                      >
                      <View style={[ styles.markerDot, { backgroundColor: getStatusColor(drone.status), opacity: 0.25 }]}/>
                      <Ionicons name={getMarkerIcon(drone.status)} size={22 * getVisualElementScale()} color={getStatusColor(drone.status)} /></TouchableOpacity>
                  ))}
                  {showWind && windIndicators.map((indicator) => (
                      <View key={indicator.id} style={[ styles.windIndicator, { left: indicator.position.x, top: indicator.position.y }]}>
                      <View style={[ styles.windArrow, { transform: [{ rotate: `${indicator.direction}deg` }] }]}>
                          <Ionicons name="arrow-up-outline" size={18 * getVisualElementScale()} color="#aa74f0" />
                      </View>
                      <View style={[styles.windSpeedBadge, { transform: [{ scale: getVisualElementScale() }] }]}>
                          <Text style={styles.windSpeedText}>{indicator.speed}</Text>
                      </View>
                      </View>
                  ))}
                  
                  {distancePoints.map((point, index) => (
                      <View key={`point-${index}`} style={[ styles.distancePoint, { left: point.x, top: point.y, transform: [{ scale: getVisualElementScale() / animatedScale.__getValue() }] } ]} />
                  ))}
                  {distancePoints.length === 2 && distance && (
                      <>
                      <View style={[ styles.distanceLine, {
                              width: Math.sqrt(Math.pow(distancePoints[1].x - distancePoints[0].x, 2) + Math.pow(distancePoints[1].y - distancePoints[0].y, 2)),
                              left: distancePoints[0].x, top: distancePoints[0].y,
                              height: 2.5 * getVisualElementScale(),
                              transform: [{ rotate: `${Math.atan2(distancePoints[1].y - distancePoints[0].y, distancePoints[1].x - distancePoints[0].x) * 180 / Math.PI}deg` }]
                          }]}
                      />
                      <View style={[ styles.distanceLabel, { left: (distancePoints[0].x + distancePoints[1].x)/2, top: (distancePoints[0].y + distancePoints[1].y)/2 }]}>
                          <Text style={[styles.distanceLabelText, { transform: [{ scale: getVisualElementScale() }] }]}>{distance?.toFixed(1)} m</Text>
                      </View>
                      </>
                  )}

                  {floatingLabel && (
                      <Animated.View style={[ styles.floatingLabel, { 
                          left: selectedItem ? selectedItem.position.x - (floatingLabel.length * 3.5) : 0,
                          top: selectedItem ? selectedItem.position.y - 35 - (20 * getVisualElementScale()) : 0,
                          opacity: floatingLabelAnim, 
                          transform: [{ translateY: floatingLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }, {scale: getVisualElementScale()}] 
                      }]}>
                      <Text style={styles.floatingLabelText}>{floatingLabel}</Text>
                      </Animated.View>
                  )}

                  {userLocation && (
                      <View style={[ styles.userLocationMarker, { left: userLocation.x, top: userLocation.y }]}>
                      <View style={styles.userLocationDot} />
                      <View style={styles.userLocationRing} />
                      </View>
                  )}

                  {measuringDistance && distancePoints.length < 2 && (
                      <View style={[styles.measuringInstructions, { transform: [{scale: getVisualElementScale()}]}]}>
                      <Text style={styles.measuringInstructionsText}>
                          {distancePoints.length === 0 ? 'Clic para marcar inicio' : 'Clic para marcar fin'}
                      </Text>
                      </View>
                  )}
              </TouchableOpacity>
          </Animated.View>
      </View>
      <View style={styles.scaleIndicator}>
        <View style={styles.scaleRow}>
          <Animated.Text style={[styles.scaleText, {transform: [{scale: animatedScale.interpolate({inputRange: [minScale, maxScale], outputRange: [0.8, 1.2]})}]}]}>
            {`${Math.round(animatedScale.__getValue() * 100)}%`}
          </Animated.Text>
          <Text style={styles.parkNameText} numberOfLines={1}>{siteData.name}</Text>
        </View>
        <View style={styles.miniMapOutline} />
      </View><View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoomIn()} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#aa74f0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoomOut()} activeOpacity={0.8}>
          <Ionicons name="remove" size={28} color="#aa74f0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => setShowLegendModal(true)} activeOpacity={0.8}>
          <Ionicons name="list-outline" size={24} color="#aa74f0" />
        </TouchableOpacity>
      </View>

      <Animated.View style={styles.zoomInstructions}>
        <Text style={styles.zoomInstructionsText}>
          Pellizca para zoom • Presiona largo para acercar
        </Text>
      </Animated.View>

      {selectedItem && (
        <View style={styles.itemDetailCard}>
          <View style={styles.itemDetailHeader}>
            <View style={styles.itemDetailHeaderLeft}>
              <Ionicons
                name={getMarkerIcon('status' in selectedItem ? selectedItem.status : (selectedItem as Facility).type)}
                size={28}
                color={getStatusColor('status' in selectedItem ? selectedItem.status : (selectedItem as Facility).type)}
              />
              <View style={styles.itemDetailInfo}>
                <Text style={styles.itemDetailName} numberOfLines={1}>{selectedItem.name}</Text>
                <Text style={styles.itemDetailStatus}>
                  {'status' in selectedItem
                    ? (selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1))
                    : (selectedItem as Facility).type.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={28} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.itemDetailContent}>
            {'power' in selectedItem && (
              <>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Potencia:</Text>
                  <Text style={styles.itemDetailValue}>{(selectedItem as Turbine).power} MW</Text>
                </View>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Eficiencia:</Text>
                  <Text style={styles.itemDetailValue}>{(selectedItem as Turbine).efficiency}%</Text>
                </View>
              </>
            )}
            {'battery' in selectedItem && (
              <>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Batería:</Text>
                  <Text style={styles.itemDetailValue}>{(selectedItem as Drone).battery}%</Text>
                </View>
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Misión Actual:</Text>
                  <Text style={styles.itemDetailValue} numberOfLines={1}>
                    {(selectedItem as Drone).currentMission || 'Ninguna'}
                  </Text>
                </View>
              </>
            )}
            { !('power' in selectedItem) && !('battery' in selectedItem) && (
                <Text style={styles.itemDetailPlaceholder}>Más detalles de la instalación aquí.</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.itemDetailButton}
            onPress={() => {
              if ('power' in selectedItem && flowType === 'inspection') {
                router.push(`/pilot/preflight-checklist?turbineId=${selectedItem.id}&turbineName=${encodeURIComponent(selectedItem.name)}&flowType=inspection`);
              } else {
                console.log('Ver detalles completos de:', selectedItem.name);
              }
            }}
          >
            <Text style={styles.itemDetailButtonText}>
              {('power' in selectedItem && flowType === 'inspection') 
                ? 'Comenzar Inspección' 
                : 'Ver Detalles Completos'
              }
            </Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showLegendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.legendModal}>
            <View style={styles.legendHeader}>
              <Text style={styles.legendTitle}>Leyenda del Mapa</Text>
              <TouchableOpacity onPress={() => setShowLegendModal(false)} style={styles.closeButtonModal}>
                <Ionicons name="close-outline" size={26} color="#4b5563" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legendContentScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.legendContent}>
                <Text style={styles.legendSectionTitle}>Turbinas Eólicas ({siteData.name})</Text>
                {filterOptions.slice(1).map(option => (
                  <View key={option.value} style={styles.legendItem}>
                    <Ionicons name={getMarkerIcon(option.value)} size={18} color={option.color} style={{marginRight: 10}}/>
                    <Text style={styles.legendItemText}>{option.label}</Text>
                    <Text style={styles.legendItemCount}>
                      {turbines.filter(t => t.status === option.value).length}
                    </Text>
                  </View>
                ))}

                <Text style={styles.legendSectionTitle}>Drones ({siteData.name})</Text>
                {(Object.keys(statusColors) as (keyof typeof statusColors)[])
                  .filter(key => ['active', 'inactive', 'charging'].includes(key))
                  .map(key => (
                  <View key={key} style={styles.legendItem}>
                     <Ionicons name={getMarkerIcon(key)} size={18} color={statusColors[key]} style={{marginRight: 10}}/>
                    <Text style={styles.legendItemText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                     <Text style={styles.legendItemCount}>{drones.filter(d => d.status === key).length}</Text>
                  </View>
                ))}

                <Text style={styles.legendSectionTitle}>Instalaciones ({siteData.name})</Text>
                <View style={styles.legendItem}>
                  <Ionicons name={getMarkerIcon('control_center')} size={18} color={facilityIconColor} style={{marginRight: 10}} />
                  <Text style={styles.legendItemText}>Centro de Control</Text>
                  <Text style={styles.legendItemCount}>{facilities.filter(f=>f.type === 'control_center').length}</Text>
                </View>
                <View style={styles.legendItem}>
                  <Ionicons name={getMarkerIcon('maintenance')} size={18} color={facilityIconColor} style={{marginRight: 10}} />
                  <Text style={styles.legendItemText}>Mantenimiento</Text>
                  <Text style={styles.legendItemCount}>{facilities.filter(f=>f.type === 'maintenance').length}</Text>
                </View>
                <View style={styles.legendItem}>
                  <Ionicons name={getMarkerIcon('storage')} size={18} color={facilityIconColor} style={{marginRight: 10}} />
                  <Text style={styles.legendItemText}>Almacén</Text>
                  <Text style={styles.legendItemCount}>{facilities.filter(f=>f.type === 'storage').length}</Text>
                </View>
                <Text style={styles.legendSectionTitle}>Indicadores</Text><View style={styles.legendItem}>
                  <View style={styles.legendWindIndicator}>
                    <Ionicons name="arrow-up-outline" size={14} color="#aa74f0" />
                  </View>
                  <Text style={styles.legendItemText}>Viento (Dirección)</Text>
                  <Text style={styles.legendItemCount}>km/h</Text>
                </View>

                <Text style={[styles.legendSectionTitle, { marginTop: 16 }]}>Medición</Text>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDotSmall, {backgroundColor: '#aa74f0'}]} />
                  <Text style={styles.legendItemText}>Punto de medición</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDistanceLine, {backgroundColor: '#aa74f0'}]} />
                  <Text style={styles.legendItemText}>Línea de distancia</Text>
                  <Text style={styles.legendItemCount}>metros</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default SiteMap;