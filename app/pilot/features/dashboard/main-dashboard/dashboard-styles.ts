import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Card Styles
  card_container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20, // Increased from 16
    marginBottom: 20, // Increased from 16
    // Removed shadow and elevation for flat design
  },
  card_title_large: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card_title_medium: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  card_title_icon: {
    color: '#6b7280', // Default icon color for card titles
  },

  // Alert Card Styles
  alertsCard_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertsCard_titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissAllButton: { // Estilo para el botón de descartar todas las alertas
    padding: 4, // Ajusta según sea necesario para el área táctil
    marginRight: 8, // Espacio entre este botón y el de expandir/colapsar
  },
  alertsCard_list: {
    marginTop: 8,
  },
  alertsCard_noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  alertsCard_noAlertsText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },

  // Alert Item Styles
  alertItem_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8, // Separación entre items
  },
  alertItem_highSeverity: {
    backgroundColor: '#fee2e2', // Light red
    borderColor: '#fca5a5', // Red border
    borderWidth: 1,
  },
  alertItem_mediumSeverity: {
    backgroundColor: '#fffbeb', // Light yellow
    borderColor: '#fde68a', // Yellow border
    borderWidth: 1,
  },
  alertItem_lowSeverity: {
    backgroundColor: '#eff6ff', // Light blue
    borderColor: '#bfdbfe', // Blue border
    borderWidth: 1,
  },
  alertItem_icon: {
    marginRight: 12,
    color: '#4b5563', // Default icon color, specific severity might override
  },
  alertItem_content: {
    flex: 1,
  },
  alertItem_message: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  alertItem_timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertItem_dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  alertItem_separator: {
    height: 1,
    backgroundColor: '#e5e7eb', // Light gray separator
    marginVertical: 4,
  },

  // Activity Item Styles (from ActivitiesDisplayList)
  activityItem_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff', // Assuming white background for items
    borderRadius: 8,
    marginBottom: 8,
  },
  activityItem_iconContainer: {
    marginHorizontal: 12,
    width: 40, // Fixed width for icon container
    alignItems: 'center',
  },
  activityItem_detailsContainer: {
    flex: 1,
  },
  activityItem_name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityItem_time: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  activityItem_description: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  activityItem_actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activityItem_actionButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 16, // Make buttons circular or rounded
  },
  activityItem_actionButtonStart: {
    // backgroundColor: '#dbeafe', // Light blue for start
  },
  activityItem_actionButtonComplete: {
    // backgroundColor: '#dcfce7', // Light green for complete
  },
  activityItem_separator: {
    height: 1,
    backgroundColor: '#f3f4f6', // Separator color for activity items
    marginVertical: 4,
  },

  // Activity Section Styles (from ActivitiesDisplayList)
  activitySection_container: {
    marginBottom: 20, // Increased from 16
  },
  activitySection_title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    paddingHorizontal: 4, // Align with card padding
  },
  noActivities_container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    minHeight: 120,
  },
  noActivities_icon: {
    marginBottom: 12,
  },
  noActivities_text: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  seeMoreButton_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  seeMoreButton_text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginRight: 6,
  },
  form_picker: {
    width: '100%',
    height: 44, // Consider if this needs to be dynamic or larger
    backgroundColor: '#ffffff', // Changed from '#f3f4f6'
    // borderRadius: 8, // borderRadius on Picker itself can be problematic
    marginBottom: 0, // Removed marginBottom as form_pickerContainer has it
    color: '#334155', // Changed from '#111827'
  },
  // Estilos para el contenedor del Picker, si necesitas centrarlo o darle márgenes específicos
  form_pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // Changed from '#d1d5db'
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff', // Added
  },
  // Estilos para los items del Picker, principalmente para iOS
  form_pickerItem: {
    // En iOS, puedes necesitar ajustar la altura o el color del texto aquí
    // height: 120, // Ejemplo de altura para items en iOS
    color: '#334155', // Color del texto de los items
  },
  form_label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  form_textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12, // Changed from 8 to match activity-log notesInput
    padding: 16, // Changed to match activity-log notesInput (uniform padding)
    fontSize: 14, // Changed from 16 to match activity-log notesInput
    color: '#1e3a8a', // Changed from '#334155' to match activity-log notesInput
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  form_textArea: {
    minHeight: 100, // Changed from 80 to match activity-log notesInput
    textAlignVertical: 'top',
  },
 // In pilot-dashboard-styles.ts
form_switchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // This is key
  marginBottom: 24, // Or your standard spacing
  paddingVertical: 8, // Optional, for touch area or visual spacing
},
  modal_overlay: {
    flex: 1,
    justifyContent: 'center', // Reverted to center for a standard modal
    alignItems: 'center', // Ensure modal_view is centered horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Standard semi-transparent background
  },
  modal_view: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    // Removed shadow and elevation for flat design
    width: '90%',
    maxHeight: '85%',
  },
  modal_headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  modal_title: {
    fontSize: 22, // Changed from 20 to match activity-log sectionTitle
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  modal_closeButton: {
    padding: 5,
  },
  modal_button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    // Removed shadow and elevation for flat design
  },
  modal_buttonText: {
    color: '#ffffff', // Ensure text is white as per activity-log actionButtonText
    fontSize: 16, // Match activity-log actionButtonText
    fontWeight: '600', // Match activity-log actionButtonText
  },
  projectBrief_container: {
    marginBottom: 20, // Increased from 16
    paddingHorizontal: 10, // Increased from 8 (proportional increase)
  },
  projectBrief_name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  primaryButton_generic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb', // Azul primario
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButton_icon: {
    marginRight: 8,
  },
  primaryButton_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDisplay_container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f3f4f6', // Un fondo neutro
  },
  statusDisplay_iconInProgress: {
    color: '#f59e0b', // Ámbar para "en progreso"
    marginRight: 10,
  },
  statusDisplay_iconCompleted: {
    color: '#10b981', // Verde para "completado"
    marginRight: 10,
  },
  statusDisplay_text: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  // HeaderInfoCard Styles
  headerCard_container: {
    padding: 24, // Increased from 20 (proportional increase)
    borderRadius: 15,
    marginBottom: 20, // Increased from 16
    // Removed shadow and elevation for flat design
  },
  headerCard_topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerCard_textContainer: {
    flex: 1, // Permite que el texto ocupe el espacio disponible
  },
  headerCard_greeting: {
    fontSize: 22,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  headerCard_pilotName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: -4, // Ajuste fino para la alineación vertical
  },
  headerCard_avatarLogoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCard_avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
  },
  headerCard_logoutButton: {
    padding: 5, // Para un área de toque más fácil
  },
  headerCard_bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCard_dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerCard_weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCard_weatherIcon: {
    width: 30, // Ajustado para un tamaño más pequeño
    height: 30,
    marginRight: 6,
  },
  headerCard_weatherText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },  quickAction_button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // Increased from 12 (proportional increase)
    margin: 8, // Increased from 5 (proportional increase)
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexGrow: 1,
    flexBasis: '45%',
    // Removed shadow and elevation for flat design
  },
  quickAction_button_main: { // Applied to the main, full-width button
    flexBasis: '94%', // Almost full width to allow for margins
    paddingVertical: 20, // Increased from 15 (proportional increase)
  },
  quickAction_iconContainer: {
    width: 32, // Adjusted size for side-by-side layout
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Space between icon and label
  },
  quickAction_label: {
    fontSize: 16, // Adjusted to match activity item label
    color: '#1f2937',
    fontWeight: '600',
    flexShrink: 1, // Allow text to wrap or shrink if necessary
  },  quickActions_grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  modal_scroll_content_container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  }
  
});
