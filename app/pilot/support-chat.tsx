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
  SlideInRight
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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

// Respuestas rápidas predefinidas para pilotos
const quickReplies: QuickReply[] = [
  {
    id: '1',
    text: 'Problemas con el Dron',
    icon: 'airplane',
    response: 'Entiendo que tienes problemas con el dron. ¿Podrías ser más específico sobre el tipo de problema? Te ayudo a resolverlo.',
    followUp: [
      {
        id: '1a',
        text: 'No enciende',
        icon: 'power',
        response: 'Verificaremos el sistema de energía. Primero, confirma si la batería está completamente cargada y si los indicadores LED muestran alguna señal.'
      },
      {
        id: '1b',
        text: 'Pérdida de señal',
        icon: 'wifi',
        response: 'Para problemas de conectividad, verifica que estés dentro del rango operativo y que no haya interferencias electromagnéticas cercanas.'
      }
    ]
  },
  {
    id: '2',
    text: 'Condiciones del Clima',
    icon: 'cloud',
    response: 'Las condiciones meteorológicas son cruciales para las operaciones. ¿Qué condiciones específicas te preocupan?',
    followUp: [
      {
        id: '2a',
        text: 'Viento fuerte',
        icon: 'leaf',
        response: 'Velocidades de viento superiores a 15 m/s requieren suspensión de vuelo. Consulta el pronóstico actualizado antes de cada misión.'
      },
      {
        id: '2b',
        text: 'Lluvia/Tormentas',
        icon: 'rainy',
        response: 'Operaciones suspendidas durante precipitaciones. Espera al menos 30 minutos después de que termine la lluvia antes de reanudar.'
      }
    ]
  },
  {
    id: '3',
    text: 'Emergencia',
    icon: 'warning',
    response: '🚨 PROTOCOLO DE EMERGENCIA ACTIVADO. Mantén la calma. ¿Cuál es la naturaleza de la emergencia?',
    followUp: [
      {
        id: '3a',
        text: 'Dron fuera de control',
        icon: 'alert-circle',
        response: 'INMEDIATAMENTE: Activa el sistema RTH (Return to Home). Si no responde, prepárate para aterrizaje de emergencia en zona segura.'
      },
      {
        id: '3b',
        text: 'Lesión personal',
        icon: 'medical',
        response: 'Contactando servicios médicos de emergencia. Mantente en tu ubicación actual. ¿Puedes describirme la lesión?'
      }
    ]
  },
  {
    id: '4',
    text: 'Equipos y Mantenimiento',
    icon: 'construct',
    response: 'Te ayudo con temas de equipamiento. ¿Qué componente necesita atención?',
    followUp: [
      {
        id: '4a',
        text: 'Calibración de cámara',
        icon: 'camera',
        response: 'Para calibración óptima: 1) Estabiliza el gimbal, 2) Ejecuta calibración automática, 3) Verifica enfoque en punto infinito.'
      },
      {
        id: '4b',
        text: 'Mantenimiento preventivo',
        icon: 'checkmark-circle',
        response: 'Programa de mantenimiento: Revisión semanal de hélices, mensual de motores, y trimestral completa. ¿Cuándo fue tu última revisión?'
      }
    ]
  },
  {
    id: '5',
    text: 'Cambios de Horario',
    icon: 'time',
    response: 'Entiendo que necesitas modificar tu programación. ¿Qué ajustes requieres en tu cronograma de vuelo?',
    followUp: [
      {
        id: '5a',
        text: 'Reprogramar misión',
        icon: 'calendar',
        response: 'Revisando disponibilidad de ventanas de vuelo. ¿Qué fecha y hora prefieres? Consideraremos condiciones meteorológicas.'
      },
      {
        id: '5b',
        text: 'Extensión de tiempo',
        icon: 'timer',
        response: 'Evaluando extensión solicitada. ¿Cuánto tiempo adicional necesitas? Verificaré conflictos con otras operaciones.'
      }
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
  status: 'En línea'
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
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReply[]>(quickReplies);
  
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Simulated admin response with typing indicator
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

    // Simulate admin response for custom message
    const responses = [
      'Gracias por tu mensaje. Estoy revisando tu consulta y te responderé en breve.',
      'Entiendo tu situación. Permíteme verificar la información y te proporciono una solución.',
      'He recibido tu consulta. Coordinaré con el equipo técnico para darte la mejor respuesta.',
      'Tu mensaje es importante para nosotros. Estoy trabajando en una respuesta personalizada.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    simulateAdminResponse(randomResponse, Math.random() * 2000 + 1000);
  }, [inputText, simulateAdminResponse]);

  const handleQuickReply = useCallback((reply: QuickReply) => {
    // Add user's quick reply as a message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply.text,
      senderId: 'pilot',
      timestamp: new Date(),
      senderName: 'Piloto',
      type: 'quick_reply'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Show admin response
    simulateAdminResponse(reply.response, 1500);

    // Update quick replies if there are follow-ups
    if (reply.followUp && reply.followUp.length > 0) {
      setTimeout(() => {
        setActiveQuickReplies(reply.followUp!);
      }, 3000);
    } else {
      setTimeout(() => {
        setActiveQuickReplies(quickReplies);
      }, 3000);
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
          isUser ? styles.pilotRow : styles.adminRow
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={32} color="#4A90E2" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.adminBubble,
          isSystem && styles.systemBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.adminText
          ]}>
            {item.text}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isUser ? styles.userTime : styles.adminTime
          ]}>
            {item.timestamp.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#34C759" />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animated.View entering={FadeInUp} style={[styles.messageRow, styles.adminRow]}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={32} color="#4A90E2" />
        </View>
        
        <View style={[styles.messageBubble, styles.adminBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { animationDelay: 0 }]} />
            <View style={[styles.typingDot, { animationDelay: 200 }]} />
            <View style={[styles.typingDot, { animationDelay: 400 }]} />
          </View>
          <Text style={styles.typingText}>Admin escribiendo...</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.chatHeader}
      >
        <Animated.View entering={FadeInDown} style={styles.adminInfo}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person-circle" size={48} color="white" />
          </View>
          
          <View style={styles.adminDetails}>
            <Text style={styles.adminName}>{adminProfile.name}</Text>
            <Text style={styles.adminRole}>{adminProfile.role}</Text>
            
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{adminProfile.status}</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={renderTypingIndicator}
        />

        {showQuickReplies && (
          <Animated.View entering={SlideInRight} style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesTitle}>Respuestas rápidas:</Text>
            
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
                    colors={['#5BA7F7', '#4A90E2']}
                    style={styles.quickReplyGradient}
                  >
                    <Ionicons name={reply.icon} size={20} color="white" />
                    <Text style={styles.quickReplyText}>{reply.text}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu consulta aquí..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#34C759', '#2DB653'] : ['#E0E0E0', '#CCCCCC']}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() ? 'white' : '#999'} 
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatHeader: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    marginRight: 12,
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 0,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  pilotRow: {
    justifyContent: 'flex-end',
  },
  adminRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 8,
  },
  adminBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
  },
  systemBubble: {
    backgroundColor: '#F0F8FF',
    borderColor: '#4A90E2',
    borderWidth: 1,
    marginHorizontal: 20,
    maxWidth: width * 0.85,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  adminText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  adminTime: {
    color: '#666',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginHorizontal: 2,
    opacity: 0.4,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quickRepliesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
    marginLeft: 4,
  },
  quickRepliesScroll: {
    paddingRight: 16,
  },
  quickReplyButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickReplyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickReplyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
