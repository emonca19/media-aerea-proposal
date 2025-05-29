import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Tipos mejorados
type EventType = 'inspection' | 'maintenance' | 'meeting' | 'report' | 'training';
type EventStatus = 'scheduled' | 'in-progress' | 'completed' | 'canceled';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: EventType;
  status: EventStatus;
  location?: string;
  equipment?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Datos de ejemplo mejorados
const currentMonth = new Date();
const calendarEvents: CalendarEvent[] = [
  { 
    id: '1', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5), 
    title: 'Inspección WTG-001', 
    type: 'inspection',
    status: 'scheduled',
    location: 'Parque Eólico Norte',
    equipment: 'Drone DJI M300',
    priority: 'high'
  },
  { 
    id: '2', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8), 
    title: 'Mantenimiento DJI M300', 
    type: 'maintenance',
    status: 'scheduled',
    equipment: 'Drone DJI M300',
    priority: 'medium'
  },
  { 
    id: '3', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12), 
    title: 'Reunión de equipo', 
    type: 'meeting',
    status: 'scheduled',
    location: 'Oficina Central'
  },
  { 
    id: '4', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15), 
    title: 'Inspección WTG-003', 
    type: 'inspection',
    status: 'scheduled',
    location: 'Parque Eólico Sur',
    equipment: 'Drone DJI M300',
    priority: 'high'
  },
  { 
    id: '5', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 18), 
    title: 'Calibración equipos', 
    type: 'maintenance',
    status: 'scheduled',
    equipment: 'Termocámara FLIR',
    priority: 'medium'
  },
  { 
    id: '6', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 22), 
    title: 'Entrega de reportes', 
    type: 'report',
    status: 'scheduled'
  },
  { 
    id: '7', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 25), 
    title: 'Visita cliente', 
    type: 'meeting',
    status: 'scheduled',
    location: 'Sede Cliente'
  },
  { 
    id: '8', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 28), 
    title: 'Inspección WTG-002', 
    type: 'inspection',
    status: 'scheduled',
    location: 'Parque Eólico Norte',
    equipment: 'Drone DJI M300',
    priority: 'high'
  },
  { 
    id: '9', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 28), 
    title: 'Capacitación seguridad', 
    type: 'training',
    status: 'scheduled',
    location: 'Sala de Conferencias'
  },
];

// Función para generar el calendario del mes actual
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  
  // Agregar días vacíos para completar la primera semana
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ date: null, dayOfMonth: null });
  }
  
  // Agregar los días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    const events = calendarEvents.filter(event => 
      event.date.getDate() === i && 
      event.date.getMonth() === month &&
      event.date.getFullYear() === year
    );
    
    days.push({
      date: currentDate,
      dayOfMonth: i,
      events
    });
  }
  
  return days;
};

// Función para obtener el nombre del mes
const getMonthName = (month: number) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
};

const getEventColor = (type: EventType) => {
  switch (type) {
    case 'inspection': return '#2563EB'; // blue-600
    case 'maintenance': return '#7C3AED'; // violet-600
    case 'meeting': return '#D97706'; // amber-600
    case 'report': return '#059669'; // emerald-600
    case 'training': return '#DC2626'; // red-600
    default: return '#4B5563'; // gray-600
  }
};

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'inspection': return 'search-outline';
    case 'maintenance': return 'construct-outline';
    case 'meeting': return 'people-outline';
    case 'report': return 'document-text-outline';
    case 'training': return 'school-outline';
    default: return 'calendar-outline';
  }
};

const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case 'scheduled': return '#3B82F6'; // blue-500
    case 'in-progress': return '#F59E0B'; // amber-500
    case 'completed': return '#10B981'; // emerald-500
    case 'canceled': return '#EF4444'; // red-500
    default: return '#6B7280'; // gray-500
  }
};

const CalendarScreen = () => {
  const router = useRouter();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentMonth);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const calendarDays = generateCalendarDays(selectedYear, selectedMonth);
  
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(null);
  };
  
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(null);
  };
  
  const goToToday = () => {
    setSelectedMonth(currentMonth.getMonth());
    setSelectedYear(currentMonth.getFullYear());
    setSelectedDate(currentMonth);
  };
  
  // Eventos para la fecha seleccionada
  const selectedEvents = selectedDate 
    ? calendarEvents.filter(event => 
        event.date.getDate() === selectedDate.getDate() && 
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear())
    : [];
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/pilot/profile')}
        >
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario de Inspecciones</Text>
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Hoy</Text>
        </TouchableOpacity>
      </View>
      
      {/* Selector de mes */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-back" size={24} color="#1E40AF" />
        </TouchableOpacity>
        
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitle}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>
        
        <TouchableOpacity onPress={nextMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-forward" size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>
      
      {/* Días de la semana */}
      <View style={styles.daysOfWeek}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
          <View key={index} style={styles.dayOfWeek}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Grilla del calendario */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.calendarDay,
              day.date && day.date.getDate() === new Date().getDate() && 
              day.date.getMonth() === new Date().getMonth() && 
              day.date.getFullYear() === new Date().getFullYear() ? 
                styles.currentDay : null,
              day.date && selectedDate && day.date.getDate() === selectedDate.getDate() && 
              day.date.getMonth() === selectedDate.getMonth() && 
              day.date.getFullYear() === selectedDate.getFullYear() ? 
                styles.selectedDay : null,
            ]}
            onPress={() => day.date ? setSelectedDate(day.date) : null}
            disabled={day.date === null}
            activeOpacity={0.7}
          >
            {day.dayOfMonth ? (
              <>
                <Text style={[
                  styles.dayNumber, 
                  day.date && selectedDate && day.date.getDate() === selectedDate.getDate() && 
                  day.date.getMonth() === selectedDate.getMonth() && 
                  day.date.getFullYear() === selectedDate.getFullYear() ? 
                    styles.selectedDayText : null,
                  day.date && day.date.getDate() === new Date().getDate() && 
                  day.date.getMonth() === new Date().getMonth() && 
                  day.date.getFullYear() === new Date().getFullYear() ? 
                    styles.currentDayText : null
                ]}>
                  {day.dayOfMonth}
                </Text>
                
                {day.events && day.events.length > 0 && (
                  <View style={styles.eventIndicators}>
                    {day.events.slice(0, 3).map((event, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.eventIndicator, 
                          { backgroundColor: getEventColor(event.type) }
                        ]} 
                      />
                    ))}
                    {day.events.length > 3 && (
                      <Text style={styles.moreEventsText}>+{day.events.length - 3}</Text>
                    )}
                  </View>
                )}
              </>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Lista de eventos */}
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>
            {selectedDate ? 
              `Eventos para ${selectedDate.getDate()} de ${getMonthName(selectedDate.getMonth())}` : 
              'Selecciona una fecha'}
          </Text>
          <Text style={styles.eventsCount}>
            {selectedEvents.length} {selectedEvents.length === 1 ? 'evento' : 'eventos'}
          </Text>
        </View>
        
        {selectedEvents.length > 0 ? (
          <ScrollView 
            style={styles.eventsList}
            showsVerticalScrollIndicator={false}
          >
            {selectedEvents.map(event => (
              <TouchableOpacity 
                key={event.id}
                style={styles.eventCard}
                onPress={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.eventTypeIndicator, { backgroundColor: getEventColor(event.type) }]} />
                
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Ionicons 
                        name={getEventIcon(event.type)} 
                        size={18} 
                        color={getEventColor(event.type)} 
                        style={styles.eventIcon}
                      />
                      <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                    
                    <View style={[styles.eventStatus, { backgroundColor: getStatusColor(event.status) }]}>
                      <Text style={styles.eventStatusText}>
                        {event.status === 'scheduled' ? 'Programado' : 
                         event.status === 'in-progress' ? 'En progreso' : 
                         event.status === 'completed' ? 'Completado' : 'Cancelado'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventTime}>
                    {event.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  
                  {expandedEvent === event.id && (
                    <View style={styles.eventDetails}>
                      {event.location && (
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={16} color="#6B7280" />
                          <Text style={styles.detailText}>{event.location}</Text>
                        </View>
                      )}
                      
                      {event.equipment && (
                        <View style={styles.detailRow}>
                          <Ionicons name="hardware-chip-outline" size={16} color="#6B7280" />
                          <Text style={styles.detailText}>{event.equipment}</Text>
                        </View>
                      )}
                      
                      {event.priority && (
                        <View style={styles.detailRow}>
                          <Ionicons 
                            name={event.priority === 'high' ? 'warning-outline' : 
                                  event.priority === 'medium' ? 'alert-circle-outline' : 'information-circle-outline'} 
                            size={16} 
                            color={
                              event.priority === 'high' ? '#EF4444' : 
                              event.priority === 'medium' ? '#F59E0B' : '#10B981'
                            } 
                          />
                          <Text style={styles.detailText}>
                            Prioridad: {event.priority === 'high' ? 'Alta' : 
                                      event.priority === 'medium' ? 'Media' : 'Baja'}
                          </Text>
                        </View>
                      )}
                      
                      <TouchableOpacity 
                        style={styles.viewDetailsButton}
                        onPress={() => console.log('Ver detalles del evento', event.id)}
                      >
                        <Text style={styles.viewDetailsButtonText}>Ver detalles completos</Text>
                        <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noEventsContainer}>
            <Ionicons name="calendar-outline" size={48} color="#E5E7EB" />
            <Text style={styles.noEventsText}>
              {selectedDate ? 'No hay eventos programados para este día' : 'Selecciona una fecha para ver los eventos'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayOfWeek: {
    width: '14.28%',
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  selectedDay: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderColor: '#3B82F6',
  },
  currentDay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  selectedDayText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  currentDayText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
  moreEventsText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },  eventsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  eventsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventsList: {
    flex: 1,
  },
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  eventTypeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  eventContent: {
    padding: 16,
    paddingLeft: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  eventDetails: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewDetailsButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default CalendarScreen;