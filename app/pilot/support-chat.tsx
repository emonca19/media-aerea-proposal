import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isFromUser: boolean;
  status: "sending" | "sent" | "delivered" | "read";
  image?: any;
}

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy Carlos, el encargado del proyecto. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(Date.now() - 300000),
      isFromUser: false,
      status: "read",
    },
    {
      id: "2",
      text: "Hola Carlos, tengo una duda sobre el cronograma de inspección de las turbinas del sector norte.",
      timestamp: new Date(Date.now() - 240000),
      isFromUser: true,
      status: "read",
    },
    {
      id: "3",
      text: "Perfecto, te ayudo con eso. Las inspecciones del sector norte están programadas para esta semana. ¿Hay algún problema específico?",
      timestamp: new Date(Date.now() - 180000),
      isFromUser: false,
      status: "read",
    },
    {
      id: "4",
      text: "Aquí tienes la imagen de la próxima turbina que necesita inspección. Es la unidad T-15 del sector norte. La inspección está programada para mañana a las 9:00 AM.",
      timestamp: new Date(Date.now() - 120000),
      isFromUser: false,
      status: "read",
      image: require("../../assets/images/wind-turbine.jpg"),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      isFromUser: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simular envío del mensaje
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 1000);

    // Simular respuesta automática
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "Gracias por tu mensaje. Te responderé en breve con la información que necesitas.",
        timestamp: new Date(),
        isFromUser: false,
        status: "read",
      };
      setMessages((prev) => [...prev, response]);
    }, 4000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isFromUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
      {message.isFromUser ? (
        <LinearGradient
          colors={["#2f4aa9", "#2f4aa9"]}
          style={styles.messageBubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.userMessageText}>{message.text}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.userMessageTime}>
              {formatTime(message.timestamp)}
            </Text>
            <View style={styles.messageStatus}>
              {message.status === "sending" && (
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
              )}
              {message.status === "sent" && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
              )}
              {message.status === "delivered" && (
                <Ionicons
                  name="checkmark-done"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
              )}
              {message.status === "read" && (
                <Ionicons name="checkmark-done" size={12} color="#10b981" />
              )}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.messageBubble, styles.otherMessageBubble]}>
          <Text style={styles.otherMessageText}>{message.text}</Text>
          {message.image && (
            <Image
              source={message.image}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.otherMessageTime}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
    >
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />
      <LinearGradient colors={["#620b97", "#c74afc"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.push("/pilot/profile")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.contactInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#322da9", "#4743ad"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>CM</Text>
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>Carlos Martínez</Text>
              <Text style={styles.contactRole}>Encargado de Proyecto</Text>
              <View style={styles.statusContainer}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>En línea</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}

        {isTyping && (
          <View style={[styles.messageContainer, styles.otherMessage]}>
            <View
              style={[
                styles.messageBubble,
                styles.otherMessageBubble,
                styles.typingBubble,
              ]}
            >
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: "0ms" }]} />
                <View style={[styles.typingDot, { animationDelay: "200ms" }]} />
                <View style={[styles.typingDot, { animationDelay: "400ms" }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />

          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim()
              ? styles.sendButtonActive
              : styles.sendButtonInactive,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <LinearGradient
            colors={
              inputText.trim() ? ["#3b82f6", "#1d4ed8"] : ["#e5e7eb", "#d1d5db"]
            }
            style={styles.sendButtonGradient}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? "white" : "#9ca3af"}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 8 : 20,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: Platform.OS === "ios" ? 10 : 8,
    marginHorizontal: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  contactInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: "#10b981",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  contactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactRole: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    backgroundColor: "#10b981",
    borderRadius: 3,
    marginRight: 4,
  },
  onlineText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  otherMessageBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageText: {
    color: "white",
    fontSize: 15,
    lineHeight: 20,
  },
  otherMessageText: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  otherMessageTime: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
  },
  messageStatus: {
    marginLeft: 6,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    backgroundColor: "#9ca3af",
    borderRadius: 3,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
    maxHeight: 100,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
  },
  sendButtonActive: {},
  sendButtonInactive: {},
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
