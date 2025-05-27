import { Ionicons } from '@expo/vector-icons'; // MaterialCommunityIcons no se usa aquí directamente
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router'; // Asumiendo que Stack se usa si no es headerShown: false
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    SlideInRight
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Reutilizamos la paleta de PreflightChecklistScreen y añadimos específicos del chat
const COLORS = {
  background: '#f8fafc', // Pantalla general
  cardBackground: '#ffffff', // Burbujas de admin, input container
  
  // Azules principales para el chat (pueden ser ligeramente diferentes al Preflight si se desea)
  chatPrimaryGradientStart: '#4A90E2', // Azul más claro para gradiente
  chatPrimaryGradientEnd: '#357ABD',   // Azul más oscuro para gradiente
  chatUserBubble: '#2563eb',           // Azul para burbuja de usuario (piloto) - igual a COLORS.primary
  
  textWhite: '#ffffff',
  textPrimary: '#1e293b',    // Texto oscuro principal
  textSecondary: '#64748b',  // Texto gris secundario
  textMuted: '#94a3b8',      // Placeholder, tiempo de mensaje
  textSystem: '#4A90E2',     // Para mensajes de sistema

  successGradientStart: '#34C759', // Verde para botón de enviar activo
  successGradientEnd: '#2DB653',

  disabledInput: '#E0E0E0',        // Para botón de enviar inactivo
  disabledInputText: '#999999',
  
  typingIndicatorDot: '#4A90E2', // Color de los puntos de "escribiendo"

  border: '#e5e7eb',          // Borde general ligero
  borderLight: '#f1f5f9',
};


interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  senderName: string;
  type: 'text' | 'quick_reply' | 'system';
  isTyping?: boolean;
}

interface QuickReply {
  id: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  response: string;
  followUp?: QuickReply[];
}

// Respuestas rápidas predefinidas para pilotos (sin cambios en datos)
const quickReplies: QuickReply[] = [ /* ... Tu data de quickReplies ... */ 
  {
    id: '1',
    text: 'Problemas con el Dron',
    icon: 'airplane',
    response: 'Entiendo que tienes problemas con el dron. ¿Podrías ser más específico sobre el tipo de problema? Te ayudo a resolverlo.',
    followUp: [
      { id: '1a', text: 'No enciende', icon: 'power', response: 'Verificaremos el sistema de energía. Primero, confirma si la batería está completamente cargada y si los indicadores LED muestran alguna señal.' },
      { id: '1b', text: 'Pérdida de señal', icon: 'wifi', response: 'Para problemas de conectividad, verifica que estés dentro del rango operativo y que no haya interferencias electromagnéticas cercanas.'}
    ]
  },
  {
    id: '2',
    text: 'Condiciones del Clima',
    icon: 'cloud',
    response: 'Las condiciones meteorológicas son cruciales para las operaciones. ¿Qué condiciones específicas te preocupan?',
    followUp: [
      { id: '2a', text: 'Viento fuerte', icon: 'leaf', response: 'Velocidades de viento superiores a 15 m/s requieren suspensión de vuelo. Consulta el pronóstico actualizado antes de cada misión.' },
      { id: '2b', text: 'Lluvia/Tormentas', icon: 'rainy', response: 'Operaciones suspendidas durante precipitaciones. Espera al menos 30 minutos después de que termine la lluvia antes de reanudar.'}
    ]
  },
  // ... resto de quickReplies
    {
    id: '3',
    text: 'Emergencia',
    icon: 'warning',
    response: '🚨 PROTOCOLO DE EMERGENCIA ACTIVADO. Mantén la calma. ¿Cuál es la naturaleza de la emergencia?',
    followUp: [
      { id: '3a', text: 'Dron fuera de control', icon: 'alert-circle', response: 'INMEDIATAMENTE: Activa el sistema RTH (Return to Home). Si no responde, prepárate para aterrizaje de emergencia en zona segura.'},
      { id: '3b', text: 'Lesión personal', icon: 'medical', response: 'Contactando servicios médicos de emergencia. Mantente en tu ubicación actual. ¿Puedes describirme la lesión?'}
    ]
  },
  {
    id: '4',
    text: 'Equipos y Mantenimiento',
    icon: 'construct',
    response: 'Te ayudo con temas de equipamiento. ¿Qué componente necesita atención?',
    followUp: [
      { id: '4a', text: 'Calibración de cámara', icon: 'camera', response: 'Para calibración óptima: 1) Estabiliza el gimbal, 2) Ejecuta calibración automática, 3) Verifica enfoque en punto infinito.'},
      { id: '4b', text: 'Mantenimiento preventivo', icon: 'checkmark-circle', response: 'Programa de mantenimiento: Revisión semanal de hélices, mensual de motores, y trimestral completa. ¿Cuándo fue tu última revisión?'}
    ]
  },
  {
    id: '5',
    text: 'Cambios de Horario',
    icon: 'time',
    response: 'Entiendo que necesitas modificar tu programación. ¿Qué ajustes requieres en tu cronograma de vuelo?',
    followUp: [
      { id: '5a', text: 'Reprogramar misión', icon: 'calendar', response: 'Revisando disponibilidad de ventanas de vuelo. ¿Qué fecha y hora prefieres? Consideraremos condiciones meteorológicas.'},
      { id: '5b', text: 'Extensión de tiempo', icon: 'timer', response: 'Evaluando extensión solicitada. ¿Cuánto tiempo adicional necesitas? Verificaré conflictos con otras operaciones.'}
    ]
  },
  {
    id: '6',
    text: 'Consulta General',
    icon: 'help-circle',
    response: 'Estoy aquí para ayudarte con cualquier consulta. ¿En qué puedo asistirte hoy?'
  }
];


const adminProfile = { /* ... Tu data de adminProfile ... */ 
  name: 'Ing. Carlos Mendoza',
  role: 'Administrador del Proyecto',
  avatar: 'person-circle', // Usaremos este nombre de icono
  status: 'En línea'
};

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([ /* ... Tu mensaje inicial ... */ 
    {
      id: '1',
      text: '¡Hola! Soy el Ing. Carlos Mendoza, Administrador del Proyecto. Estoy aquí para ayudarte con cualquier consulta operativa, técnica o de emergencia. Utiliza las respuestas rápidas abajo o escribe tu pregunta directamente.',
      senderId: 'admin',
      timestamp: new Date(),
      senderName: adminProfile.name,
      type: 'system'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReply[]>(quickReplies);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { /* ... Tu useEffect ... */ 
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const simulateAdminResponse = useCallback((responseText: string, delay: number = 2000) => { /* ... Tu simulateAdminResponse ... */ 
    setIsTyping(true);
    setShowQuickReplies(false);
    
    setTimeout(() => {
      setIsTyping(false);
      const adminReply: Message = {
        id: Date.now().toString(),
        text: responseText,
        senderId: 'admin',
        timestamp: new Date(),
        senderName: adminProfile.name,
        type: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, adminReply]);
      setShowQuickReplies(true);
      setActiveQuickReplies(quickReplies); // Reset to main quick replies
    }, delay);
  }, []);

  const handleSendMessage = useCallback(() => { /* ... Tu handleSendMessage ... */ 
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'pilot',
      timestamp: new Date(),
      senderName: 'Piloto', // Puedes obtener el nombre del piloto real si lo tienes
      type: 'text'
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    const responses = [ /* ... Tus respuestas simuladas ... */ 
      'Gracias por tu mensaje. Estoy revisando tu consulta y te responderé en breve.',
      'Entiendo tu situación. Permíteme verificar la información y te proporciono una solución.',
      'He recibido tu consulta. Coordinaré con el equipo técnico para darte la mejor respuesta.',
      'Tu mensaje es importante para nosotros. Estoy trabajando en una respuesta personalizada.'
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    simulateAdminResponse(randomResponse, Math.random() * 2000 + 1000);
  }, [inputText, simulateAdminResponse]);

  const handleQuickReply = useCallback((reply: QuickReply) => { /* ... Tu handleQuickReply ... */ 
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply.text,
      senderId: 'pilot',
      timestamp: new Date(),
      senderName: 'Piloto',
      type: 'quick_reply'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    simulateAdminResponse(reply.response, 1500);

    if (reply.followUp && reply.followUp.length > 0) {
      setTimeout(() => setActiveQuickReplies(reply.followUp!), 2500); // Show follow-up sooner
    } else {
      setTimeout(() => setActiveQuickReplies(quickReplies), 2500); // Reset sooner
    }
  }, [simulateAdminResponse]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.senderId === 'pilot';
    const isSystem = item.type === 'system';

    return (
      <Animated.View 
        entering={FadeInUp.delay(100)} 
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.adminMessageRow,
          isSystem && styles.systemMessageRow, // Center system messages
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.avatarContainer}>
            <Ionicons name={adminProfile.avatar as any} size={30} color={COLORS.chatPrimaryGradientStart} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.adminMessageBubble,
          isSystem && styles.systemMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.adminMessageText,
            isSystem && styles.systemMessageText,
          ]}>
            {item.text}
          </Text>
          
          {!isSystem && ( // No mostrar tiempo para mensajes de sistema si no se desea
            <Text style={[
              styles.messageTimestamp,
              isUser ? styles.userMessageTimestamp : styles.adminMessageTimestamp
            ]}>
              {item.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            {/* Puedes cambiar el icono del piloto o usar una imagen */}
            <Ionicons name="person-outline" size={30} color={COLORS.successGradientStart} />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animated.View entering={FadeInUp} style={[styles.messageRow, styles.adminMessageRow]}>
        <View style={styles.avatarContainer}>
          <Ionicons name={adminProfile.avatar as any} size={30} color={COLORS.chatPrimaryGradientStart} />
        </View>
        
        <View style={[styles.messageBubble, styles.adminMessageBubble, styles.typingBubble]}>
          <View style={styles.typingIndicatorDots}>
            <Animated.View style={[styles.typingDot, { transform: [{scale: FadeInUp.duration(300).delay(0).springify() }] }]} />
            <Animated.View style={[styles.typingDot, { transform: [{scale: FadeInUp.duration(300).delay(150).springify() }] }]} />
            <Animated.View style={[styles.typingDot, { transform: [{scale: FadeInUp.duration(300).delay(300).springify() }] }]} />
          </View>
          {/* <Text style={styles.typingInfoText}>Admin escribiendo...</Text> // Opcional */}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.chatPrimaryGradientStart} />
      
      <LinearGradient
        colors={[COLORS.chatPrimaryGradientStart, COLORS.chatPrimaryGradientEnd]}
        style={styles.chatHeaderContainer}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.adminInfoContainer}>
          <View style={styles.adminAvatarWrapper}>
            <Ionicons name={adminProfile.avatar as any} size={42} color={COLORS.textWhite} />
          </View>
          
          <View style={styles.adminTextDetails}>
            <Text style={styles.adminDisplayName}>{adminProfile.name}</Text>
            <Text style={styles.adminDisplayRole}>{adminProfile.role}</Text>
            
            <View style={styles.adminStatusIndicator}>
              <View style={styles.onlineStatusDot} />
              <Text style={styles.onlineStatusText}>{adminProfile.status}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatInteractionArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Ajustar según sea necesario
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageListContainer}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
        />

        {showQuickReplies && activeQuickReplies.length > 0 && (
          <Animated.View entering={SlideInRight.duration(300)} style={styles.quickRepliesSection}>
            <Text style={styles.quickRepliesHeaderTitle}>Sugerencias:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesScrollContainer}
            >
              {activeQuickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  onPress={() => handleQuickReply(reply)}
                  style={styles.quickReplyButtonWrapper}
                >
                  <LinearGradient
                    colors={[COLORS.chatPrimaryGradientStart, COLORS.chatPrimaryGradientEnd]} // Mismo gradiente que el header
                    style={styles.quickReplyButtonGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} // Dirección del gradiente
                  >
                    <Ionicons name={reply.icon} size={18} color={COLORS.textWhite} style={{marginRight: 6}}/>
                    <Text style={styles.quickReplyButtonText}>{reply.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.chatInputArea}>
          <View style={styles.chatInputWrapper}>
            <TextInput
              style={styles.mainTextInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500} // Opcional
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[styles.sendMessageButton, inputText.trim() && styles.sendMessageButtonActive]}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? [COLORS.successGradientStart, COLORS.successGradientEnd] : [COLORS.disabledInput, COLORS.disabledInput]}
                style={styles.sendMessageButtonGradient}
              >
                <Ionicons 
                  name="send-outline" // Cambiado a outline para consistencia
                  size={20} 
                  color={inputText.trim() ? COLORS.textWhite : COLORS.disabledInputText} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // --- Header ---
  chatHeaderContainer: {
    paddingTop: (StatusBar.currentHeight || 0) + 10, // Espacio para la barra de estado
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15, // Curvatura sutil
    borderBottomRightRadius: 15,
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatarWrapper: {
    marginRight: 12,
    // Opcional: añadir un borde o fondo si se quiere
    // backgroundColor: 'rgba(255,255,255,0.2)',
    // borderRadius: 25,
    // padding: 2,
  },
  adminTextDetails: {
    flex: 1,
  },
  adminDisplayName: {
    fontSize: 17, // Ligeramente más pequeño para balance
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  adminDisplayRole: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 3,
  },
  adminStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatusDot: {
    width: 7, // Más pequeño
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.successGradientStart, // Verde brillante
    marginRight: 5,
  },
  onlineStatusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // --- Área de Chat (Mensajes y Entrada) ---
  chatInteractionArea: {
    flex: 1,
  },
  messageListContainer: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 12, // Espacio arriba y abajo de la lista de mensajes
    paddingHorizontal: 12, // Espacio a los lados de los mensajes
  },

  // --- Filas y Avatares de Mensajes ---
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alinea burbuja y avatar abajo
    marginVertical: 6, // Espacio vertical entre mensajes
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  adminMessageRow: {
    justifyContent: 'flex-start',
  },
  systemMessageRow: { // Para centrar mensajes de sistema
    justifyContent: 'center',
    marginVertical: 10,
  },
  avatarContainer: {
    width: 32, // Tamaño de avatar
    height: 32,
    borderRadius: 16, // Círculo perfecto
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6, // Espacio entre avatar y burbuja
    // backgroundColor: COLORS.borderLight, // Fondo sutil para el avatar
  },

  // --- Burbujas de Mensaje ---
  messageBubble: {
    maxWidth: width * 0.75, // Ancho máximo de la burbuja
    paddingHorizontal: 14, // Padding horizontal
    paddingVertical: 10,   // Padding vertical
    borderRadius: 18,      // Bordes redondeados
    // Sombra sutil para todas las burbujas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: COLORS.chatUserBubble, // Azul definido
    borderBottomRightRadius: 6, // Esquina distintiva
  },
  adminMessageBubble: {
    backgroundColor: COLORS.cardBackground, // Blanco
    borderBottomLeftRadius: 6, // Esquina distintiva
    borderWidth: 1, // Borde sutil para burbujas blancas
    borderColor: COLORS.borderLight,
  },
  systemMessageBubble: {
    backgroundColor: COLORS.borderLight, // Fondo muy claro para sistema
    borderColor: COLORS.border, // Borde un poco más oscuro
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10, // Menos redondeado para sistema
    maxWidth: width * 0.85, // Pueden ser más anchos
    alignSelf: 'center', // Asegura que esté centrado
  },
  typingBubble: { // Burbuja para "escribiendo..."
    paddingVertical: 12, // Un poco más de padding para los puntos
  },

  // --- Texto y Timestamp de Mensajes ---
  messageText: {
    fontSize: 15, // Tamaño de texto legible
    lineHeight: 20, // Espaciado de línea
  },
  userMessageText: {
    color: COLORS.textWhite,
  },
  adminMessageText: {
    color: COLORS.textPrimary, // Texto oscuro en burbuja blanca
  },
  systemMessageText: {
    color: COLORS.textSystem, // Color azul para texto de sistema
    textAlign: 'center', // Centrar texto de sistema
    fontSize: 13,
    fontStyle: 'italic',
  },
  messageTimestamp: {
    fontSize: 10, // Pequeño
    marginTop: 5, // Espacio sobre el texto
    opacity: 0.8, // Ligeramente transparente
  },
  userMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  adminMessageTimestamp: {
    color: COLORS.textMuted, // Gris claro para timestamp de admin
    textAlign: 'right',
  },
  
  // --- Indicador de "Escribiendo" ---
  typingIndicatorDots: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center', // Si quieres los puntos centrados
    // marginBottom: 4, // Si tienes texto debajo
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.typingIndicatorDot, // Azul definido
    marginHorizontal: 2.5, // Espacio entre puntos
    // La animación se maneja con Reanimated en el componente
  },
  // typingInfoText: { // Opcional, si quieres "Admin escribiendo..."
  //   fontSize: 11,
  //   color: COLORS.textMuted,
  //   fontStyle: 'italic',
  //   textAlign: 'left', // Alineado con los puntos
  //   marginLeft: 2, // Ligeramente indentado
  // },

  // --- Respuestas Rápidas ---
  quickRepliesSection: {
    paddingVertical: 12, // Menos padding vertical
    backgroundColor: COLORS.cardBackground, // Fondo blanco
    borderTopWidth: 1,
    borderTopColor: COLORS.border, // Borde sutil
  },
  quickRepliesHeaderTitle: {
    fontSize: 13, // Más pequeño
    fontWeight: '600',
    color: COLORS.textSecondary, // Gris en lugar de azul
    marginBottom: 8,
    paddingHorizontal: 16, // Alinear con la lista de mensajes
  },
  quickRepliesScrollContainer: {
    paddingHorizontal: 16, // Padding para el primer y último elemento
    paddingVertical: 4, // Pequeño padding vertical para el scroll
  },
  quickReplyButtonWrapper: {
    marginRight: 10, // Espacio entre botones
    borderRadius: 18, // Redondeo del botón
    overflow: 'hidden', // Para que el gradiente respete el borde
    // Sombra sutil para los botones
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickReplyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, // Padding interno del botón
    paddingVertical: 9,    // Padding interno del botón
  },
  quickReplyButtonText: {
    color: COLORS.textWhite,
    fontSize: 13, // Un poco más pequeño
    fontWeight: '500', // Ligeramente menos bold
    // marginLeft: 6, // Ya se maneja con el marginRight del icono
  },

  // --- Área de Entrada de Texto ---
  chatInputArea: {
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12, // Menos padding horizontal
    paddingTop: 8, // Menos padding arriba
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Más padding abajo en iOS por el "home indicator"
  },
  chatInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alinea el input y el botón abajo si el input es multilínea
    backgroundColor: COLORS.background, // Gris muy claro para el input field
    borderRadius: 22, // Más redondeado
    paddingLeft: 16, // Padding izquierdo para el texto
    paddingRight: 6, // Padding derecho para el botón
    paddingVertical: Platform.OS === 'ios' ? 10 : 6, // Ajuste de padding vertical por plataforma
    minHeight: 44, // Altura mínima
  },
  mainTextInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 90, // Limitar altura si es multilínea
    paddingTop: Platform.OS === 'ios' ? 0 : 2, // Ajuste fino para centrado vertical
    paddingBottom: Platform.OS === 'ios' ? 0 : 2,
    lineHeight: 18, // Para mejor legibilidad en multilínea
  },
  sendMessageButton: {
    marginLeft: 8, // Espacio entre input y botón
    borderRadius: 18, // Botón circular
    overflow: 'hidden', // Para el gradiente
    // La transición de escala se maneja con el style `sendMessageButtonActive` en el componente
  },
  sendMessageButtonActive: {
    // No es necesario aquí si la animación es solo transform
  },
  sendMessageButtonGradient: {
    width: 36, // Botón más compacto
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});