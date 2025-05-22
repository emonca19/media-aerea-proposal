import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Datos de ejemplo para el calendario
const currentMonth = new Date();
const calendarEvents = [
  { 
    id: '1', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5), 
    title: 'Inspección WTG-001', 
    type: 'inspection',
    status: 'scheduled'
  },
  { 
    id: '2', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8), 
    title: 'Mantenimiento DJI M300', 
    type: 'maintenance',
    status: 'scheduled'
  },
  { 
    id: '3', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 12), 
    title: 'Reunión de equipo', 
    type: 'meeting',
    status: 'scheduled'
  },
  { 
    id: '4', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15), 
    title: 'Inspección WTG-003', 
    type: 'inspection',
    status: 'scheduled'
  },
  { 
    id: '5', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 18), 
    title: 'Calibración equipos', 
    type: 'maintenance',
    status: 'scheduled'
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
    status: 'scheduled'
  },
  { 
    id: '8', 
    date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 28), 
    title: 'Inspección WTG-002', 
    type: 'inspection',
    status: 'scheduled'
  },
];

// Función para generar el calendario del mes actual
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
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

const getEventColor = (type: string) => {
  switch (type) {
    case 'inspection': return '#3b82f6'; // blue
    case 'maintenance': return '#8b5cf6'; // purple
    case 'meeting': return '#f59e0b'; // amber
    case 'report': return '#10b981'; // emerald
    default: return '#6b7280'; // gray
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'inspection': return 'camera-outline';
    case 'maintenance': return 'construct-outline';
    case 'meeting': return 'people-outline';
    case 'report': return 'document-text-outline';
    default: return 'calendar-outline';
  }
};

export default function CalendarScreen() {
  const router = useRouter();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const calendarDays = generateCalendarDays(selectedYear, selectedMonth);
  
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario</Text>
      </View>
      
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysOfWeek}>
        <Text style={styles.dayOfWeekText}>Dom</Text>
        <Text style={styles.dayOfWeekText}>Lun</Text>
        <Text style={styles.dayOfWeekText}>Mar</Text>
        <Text style={styles.dayOfWeekText}>Mié</Text>
        <Text style={styles.dayOfWeekText}>Jue</Text>
        <Text style={styles.dayOfWeekText}>Vie</Text>
        <Text style={styles.dayOfWeekText}>Sáb</Text>
      </View>
      
      <View style={styles.calendar}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.calendarDay,
              day.date && selectedDate && day.date.getDate() === selectedDate.getDate() && 
              day.date.getMonth() === selectedDate.getMonth() && 
              day.date.getFullYear() === selectedDate.getFullYear() ? 
                styles.selectedDay : null
            ]}
            onPress={() => day.date ? setSelectedDate(day.date) : null}
            disabled={day.date === null}
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
                  <View style={styles.eventIndicatorContainer}>
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
      
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {selectedDate ? 
            `Eventos para ${selectedDate.getDate()} de ${getMonthName(selectedDate.getMonth())}` : 
            'Selecciona una fecha para ver eventos'}
        </Text>
        
        <ScrollView style={styles.eventsList}>
          {selectedEvents.length > 0 ? (
            selectedEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={[styles.eventTypeIndicator, { backgroundColor: getEventColor(event.type) }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {event.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <Ionicons name={getEventIcon(event.type)} size={24} color={getEventColor(event.type)} />
              </View>
            ))
          ) : (
            selectedDate ? 
              <Text style={styles.noEventsText}>No hay eventos para esta fecha</Text> : 
              <Text style={styles.noEventsText}>Selecciona una fecha para ver los eventos</Text>
          )}
        </ScrollView>
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
  },
  dayOfWeekText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    padding: 4,
    justifyContent: 'flex-start',
  },
  selectedDay: {
    backgroundColor: '#dbeafe',
    borderRadius: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '400',
    color: '#334155',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  currentDayText: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
    lineHeight: 24,
  },
  eventIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  eventIndicator: {
    height: 4,
    width: 4,
    borderRadius: 2,
    margin: 1,
  },
  moreEventsText: {
    fontSize: 8,
    color: '#64748b',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTypeIndicator: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#64748b',
  },
  noEventsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});
