import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
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
  interpolate,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#f8fafc',
  cardBackground: '#ffffff',
  
  // Primary gradient colors
  primaryGradientStart: '#4F46E5',  // Indigo-600
  primaryGradientEnd: '#7C3AED',    // Violet-600
  
  // Message bubbles
  userBubble: '#4F46E5',           // Indigo-600
  adminBubble: '#ffffff',
  systemBubble: '#E0E7FF',         // Indigo-100
  
  // Text colors
  textWhite: '#ffffff',
  textPrimary: '#1F2937',          // Gray-800
  textSecondary: '#6B7280',        // Gray-500
  textMuted: '#9CA3AF',            // Gray-400
  textSystem: '#3730A3',           // Indigo-800

  // Status colors
  successGradientStart: '#10B981',  // Emerald-500
  successGradientEnd: '#059669',    // Emerald-600
  errorGradientStart: '#EF4444',    // Red-500
  errorGradientEnd: '#DC2626',      // Red-600
  
  // UI elements
  disabledInput: '#E5E7EB',        // Gray-200
  disabledInputText: '#9CA3AF',    // Gray-400
  typingIndicatorDot: '#818CF8',   // Indigo-400
  border: '#E5E7EB',               // Gray-200
  borderLight: '#F3F4F6',          // Gray-100
  highlight: '#EDE9FE',            // Violet-100
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

const quickReplies: QuickReply[] = [
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

const adminProfile = {
  name: 'Ing. Carlos Mendoza',
  role: 'Administrador del Proyecto',
  avatar: 'person-circle',
  status: 'En línea',
  statusColor: COLORS.successGradientStart
};

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([
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
  const [quickRepliesExpanded, setQuickRepliesExpanded] = useState(true);
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReply[]>(quickReplies);
  const [isCalling, setIsCalling] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Animations
  const callAnimation = useSharedValue(0);
  const typingAnimation = useSharedValue(0);
  
  useEffect(() => {
    if (isCalling) {
      callAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      callAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isCalling, callAnimation]);

  useEffect(() => {
    if (isTyping) {
      typingAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      typingAnimation.value = 0;
    }
  }, [isTyping, typingAnimation]);

  const callButtonAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(callAnimation.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(callAnimation.value, [0, 1], [1, 0.8]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const typingDotAnimatedStyle = useAnimatedStyle((index) => {
    const delay = index * 200;
    const opacity = interpolate(
      typingAnimation.value,
      [0, 0.5, 1],
      [0.5, 1, 0.5],
      {
        extrapolateRight: 'clamp',
      }
    );
    
    const scale = interpolate(
      typingAnimation.value,
      [0, 0.5, 1],
      [0.8, 1.2, 0.8],
      {
        extrapolateRight: 'clamp',
      }
    );
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const simulateAdminResponse = useCallback((responseText: string, delay: number = 2000) => {
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
      setActiveQuickReplies(quickReplies);
    }, delay);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'pilot',
      timestamp: new Date(),
      senderName: 'Piloto',
      type: 'text'
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    const responses = [
      'Gracias por tu mensaje. Estoy revisando tu consulta y te responderé en breve.',
      'Entiendo tu situación. Permíteme verificar la información y te proporciono una solución.',
      'He recibido tu consulta. Coordinaré con el equipo técnico para darte la mejor respuesta.',
      'Tu mensaje es importante para nosotros. Estoy trabajando en una respuesta personalizada.'
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    simulateAdminResponse(randomResponse, Math.random() * 2000 + 1000);
  }, [inputText, simulateAdminResponse]);

  const handleCall = useCallback(() => {
    setIsCalling(true);
    
    // Simulate call duration (5 seconds)
    setTimeout(() => {
      setIsCalling(false);
      
      // Add system message confirming the call
      const callMessage: Message = {
        id: Date.now().toString(),
        text: '📞 Llamada realizada al Ing. Carlos Mendoza. Te contactará en breve para atender tu consulta de manera personalizada.',
        senderId: 'system',
        timestamp: new Date(),
        senderName: 'Sistema',
        type: 'system'
      };
      
      setMessages(prevMessages => [...prevMessages, callMessage]);
    }, 5000);
  }, []);

  const handleQuickReply = useCallback((reply: QuickReply) => {
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
      setTimeout(() => setActiveQuickReplies(reply.followUp!), 2500);
    } else {
      setTimeout(() => setActiveQuickReplies(quickReplies), 2500);
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
          isSystem && styles.systemMessageRow,
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
              style={styles.avatarGradient}
            >
              <Ionicons name={adminProfile.avatar as any} size={22} color={COLORS.textWhite} />
            </LinearGradient>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.adminMessageBubble,
          isSystem && styles.systemMessageBubble
        ]}>
          {!isSystem && (
            <Text style={[
              styles.messageSender,
              isUser ? styles.userMessageSender : styles.adminMessageSender
            ]}>
              {item.senderName}
            </Text>
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.adminMessageText,
            isSystem && styles.systemMessageText,
          ]}>
            {item.text}
          </Text>
          
          {!isSystem && (
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
            <LinearGradient
              colors={[COLORS.successGradientStart, COLORS.successGradientEnd]}
              style={styles.avatarGradient}
            >
              <Ionicons name="person-outline" size={22} color={COLORS.textWhite} />
            </LinearGradient>
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
          <LinearGradient
            colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
            style={styles.avatarGradient}
          >
            <Ionicons name={adminProfile.avatar as any} size={22} color={COLORS.textWhite} />
          </LinearGradient>
        </View>
        
        <View style={[styles.messageBubble, styles.adminMessageBubble, styles.typingBubble]}>
          <Text style={[styles.messageSender, styles.adminMessageSender]}>
            {adminProfile.name}
          </Text>
          
          <View style={styles.typingIndicatorContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.typingDot,
                  typingDotAnimatedStyle(index)
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGradientStart} />
      
      {/* Header with admin info */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          
          <View style={styles.adminInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
                style={styles.avatarGradient}
              >
                <Ionicons name={adminProfile.avatar as any} size={28} color={COLORS.textWhite} />
              </LinearGradient>
            </View>
            
            <View style={styles.adminTextInfo}>
              <Text style={styles.adminName}>{adminProfile.name}</Text>
              <Text style={styles.adminRole}>{adminProfile.role}</Text>
            </View>
          </View>
          
          <Animated.View style={[styles.callButtonContainer, callButtonAnimatedStyle]}>
            <TouchableOpacity
              onPress={handleCall}
              style={styles.callButton}
              disabled={isCalling}
            >
              <LinearGradient
                colors={isCalling 
                  ? [COLORS.errorGradientStart, COLORS.errorGradientEnd] 
                  : [COLORS.successGradientStart, COLORS.successGradientEnd]}
                style={styles.callButtonGradient}
              >
                <Ionicons 
                  name={isCalling ? "call" : "call-outline"} 
                  size={20} 
                  color={COLORS.textWhite} 
                />
                {isCalling && (
                  <Text style={styles.callingText}>Llamando...</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: adminProfile.statusColor }]} />
          <Text style={styles.statusText}>{adminProfile.status}</Text>
        </View>
      </LinearGradient>

      {/* Chat area */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        />

        {/* Quick replies section */}
        {showQuickReplies && activeQuickReplies.length > 0 && (
          <Animated.View 
            entering={SlideInRight.duration(300)} 
            style={styles.quickRepliesContainer}
          >
            <TouchableOpacity
              onPress={() => setQuickRepliesExpanded(!quickRepliesExpanded)}
              style={styles.quickRepliesHeader}
            >
              <Text style={styles.quickRepliesTitle}>Respuestas rápidas</Text>
              <Ionicons 
                name={quickRepliesExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
            
            {quickRepliesExpanded && (
              <Animated.View entering={FadeInDown.duration(200)}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickRepliesScroll}
                >
                  {activeQuickReplies.map((reply) => (
                    <TouchableOpacity
                      key={reply.id}
                      onPress={() => handleQuickReply(reply)}
                      style={styles.quickReplyButton}
                    >
                      <LinearGradient
                        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
                        style={styles.quickReplyGradient}
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name={reply.icon} size={18} color={COLORS.textWhite} style={styles.quickReplyIcon}/>
                        <Text style={styles.quickReplyText}>{reply.text}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Input area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() 
                  ? [COLORS.primaryGradientStart, COLORS.primaryGradientEnd] 
                  : [COLORS.disabledInput, COLORS.disabledInput]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name="send"
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
  
  // Header styles
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  adminInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  
  adminTextInfo: {
    marginLeft: 12,
  },
  
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textWhite,
    marginBottom: 2,
  },
  
  adminRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  callButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  
  callButton: {
    flex: 1,
  },
  
  callButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  callingText: {
    fontSize: 10,
    color: COLORS.textWhite,
    marginTop: 2,
    fontWeight: '500',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  // Chat container styles
  chatContainer: {
    flex: 1,
  },
  
  messageList: {
    flex: 1,
  },
  
  messageListContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  // Message styles
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  
  adminMessageRow: {
    justifyContent: 'flex-start',
  },
  
  systemMessageRow: {
    justifyContent: 'center',
    marginVertical: 12,
  },
  
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  userMessageBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  
  adminMessageBubble: {
    backgroundColor: COLORS.adminBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  
  systemMessageBubble: {
    backgroundColor: COLORS.systemBubble,
    borderColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    maxWidth: width * 0.85,
    alignSelf: 'center',
  },
  
  typingBubble: {
    paddingVertical: 12,
  },
  
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  userMessageSender: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  adminMessageSender: {
    color: COLORS.textSecondary,
  },
  
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  
  userMessageText: {
    color: COLORS.textWhite,
  },
  
  adminMessageText: {
    color: COLORS.textPrimary,
  },
  
  systemMessageText: {
    color: COLORS.textSystem,
    textAlign: 'center',
    fontSize: 14,
  },
  
  messageTimestamp: {
    fontSize: 10,
    marginTop: 6,
    opacity: 0.8,
  },
  
  userMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  
  adminMessageTimestamp: {
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.typingIndicatorDot,
    marginHorizontal: 3,
  },
  
  // Quick replies styles
  quickRepliesContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 8,
  },
  
  quickRepliesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  quickRepliesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  
  quickReplyButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  quickReplyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  
  quickReplyIcon: {
    marginRight: 8,
  },
  
  quickReplyText: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Input area styles
  inputContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    lineHeight: 20,
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
    marginBottom: 4,
  },
  
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});