import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Removed Image import

// Mock admin ID (replace with actual admin ID from your system)
const ADMIN_ID = 'admin_user_001';
const PILOT_ID = 'pilot_user_123'; // Example pilot ID

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  senderName: string;
  avatarIcon?: keyof typeof Ionicons.glyphMap;
  avatarColor?: string;
}

// Mock avatars - using Ionicons for simplicity
const adminAvatar = { icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap, color: '#4A5568' }; // Dark Gray for Admin
const pilotAvatar = { icon: 'person-circle' as keyof typeof Ionicons.glyphMap, color: '#1D4ED8' }; // Blue for Pilot

export default function SupportChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null); // Ref for FlatList

  // Simulate loading initial messages or past conversation
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Hola, ¿en qué puedo ayudarte?',
        senderId: ADMIN_ID,
        timestamp: new Date(Date.now() - 60000 * 5),
        senderName: 'Soporte Admin',
        avatarIcon: adminAvatar.icon,
        avatarColor: adminAvatar.color,
      },
      {
        id: '2',
        text: 'Tengo un problema con el dron XP200.',
        senderId: PILOT_ID,
        timestamp: new Date(Date.now() - 60000 * 3),
        senderName: 'Tú',
        avatarIcon: pilotAvatar.icon,
        avatarColor: pilotAvatar.color,
      },
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) { // Check messages.length
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (inputText.trim().length === 0) {
      return;
    }
    const newMessage: Message = {
      id: String(Date.now()),
      text: inputText.trim(),
      senderId: PILOT_ID, // Assume pilot is sending
      timestamp: new Date(),
      senderName: 'Tú',
      avatarIcon: pilotAvatar.icon,
      avatarColor: pilotAvatar.color,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    // Simulate admin auto-reply after a short delay
    setTimeout(() => {
      const adminReply: Message = {
        id: String(Date.now() + 1),
        text: 'Recibido. Nuestro equipo de soporte revisará tu consulta y te contactará en breve.',
        senderId: ADMIN_ID,
        timestamp: new Date(),
        senderName: 'Soporte Admin',
        avatarIcon: adminAvatar.icon,
        avatarColor: adminAvatar.color,
      };
      setMessages(prevMessages => [...prevMessages, adminReply]);
    }, 1500);
  }, [inputText]);

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isPilotMessage = item.senderId === PILOT_ID;
    return (
      <View style={[styles.messageRow, isPilotMessage ? styles.pilotRow : styles.adminRow]}>
        {!isPilotMessage && (
          <View style={styles.avatarContainer}>
            {item.avatarIcon &&
              <Ionicons name={item.avatarIcon} size={32} color={item.avatarColor || '#cccccc'} />
            }
          </View>
        )}
        <View style={styles.messageContentOuterContainer}>
          <Text style={[styles.senderName, isPilotMessage ? styles.pilotSenderName : styles.adminSenderName]}>
            {item.senderName}
          </Text>
          <View style={[
            styles.messageBubble,
            isPilotMessage ? styles.pilotMessage : styles.adminMessage
          ]}>
            <Text style={[
              styles.messageText,
              isPilotMessage && styles.pilotMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.messageTimestamp,
              isPilotMessage ? styles.pilotMessageTimestamp : styles.adminMessageTimestamp
            ]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        {isPilotMessage && (
          <View style={styles.avatarContainer}>
            {item.avatarIcon &&
              <Ionicons name={item.avatarIcon} size={32} color={item.avatarColor || '#cccccc'} />
            }
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // Adjusted offset
    >
      <FlatList
        ref={flatListRef} // Assign ref
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 10 }} // Added horizontal padding
        // inverted prop removed to show messages from top to bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#9ca3af"
          multiline // Allow multiline input
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="arrow-up-circle" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF', // Lighter blue background
  },
  messagesList: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom of the row (for avatar and bubble)
    marginVertical: 8,
  },
  pilotRow: {
    justifyContent: 'flex-end',
  },
  adminRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    // backgroundColor: '#D1D5DB', // Placeholder color if no icon
  },
  messageContentOuterContainer: {
    maxWidth: '75%',
    flexDirection: 'column', // Stack sender name and bubble vertically
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280', // Medium gray for sender name
    marginBottom: 2,
  },
  adminSenderName: {
    alignSelf: 'flex-start',
    marginLeft: 5, // Align with bubble padding
  },
  pilotSenderName: {
    alignSelf: 'flex-end',
    marginRight: 5, // Align with bubble padding
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18, // Slightly more rounded
  },
  pilotMessage: {
    backgroundColor: '#1D4ED8', // Pilot message color (Vibrant Blue)
    borderBottomRightRadius: 4, // Tail effect
    marginLeft: 'auto', // Push to right
  },
  adminMessage: {
    backgroundColor: '#FFFFFF', // Admin message color (White)
    borderBottomLeftRadius: 4, // Tail effect
    marginRight: 'auto', // Push to left
    borderColor: '#E5E7EB',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22, // Improved readability
  },
  pilotMessageText: {
    color: '#FFFFFF',
  },
  adminMessageText: { // Explicitly define for admin if needed, otherwise inherits from messageText
    color: '#1F2937',
  },
  messageTimestamp: {
    fontSize: 10,
    marginTop: 5,
  },
  pilotMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
  },
  adminMessageTimestamp: {
    color: '#A0AEC0', // Lighter gray for admin timestamp
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB', // Slightly darker border
    backgroundColor: '#FFFFFF', // White background for input area
  },
  textInput: {
    flex: 1,
    minHeight: 42, // Slightly taller
    maxHeight: 120,
    backgroundColor: '#F3F4F6', // Light gray input background
    borderRadius: 21, // Fully rounded ends
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 20, // Adjust line height for multiline
  },
  sendButton: {
    backgroundColor: '#1D4ED8', // Match pilot message bubble
    borderRadius: 21, // Match text input
    width: 42, // Square button
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
});
