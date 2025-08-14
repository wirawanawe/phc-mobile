import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { safeGoBack } from "../utils/safeNavigation";

interface Message {
  id: number;
  sender_type: "user" | "doctor" | "ai" | "system";
  sender_id?: number;
  message: string;
  message_type: "text" | "image" | "file" | "system";
  is_read: boolean;
  created_at: string;
}

const ChatDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme<CustomTheme>();
  const { isAuthenticated } = useAuth();
  const { chatId, chatType, title, doctor } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const loadMessages = async (pageNum = 1, append = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.getChatMessages(chatId, {
        page: pageNum,
        limit: 50,
      });
      
      if (response.success) {
        const newMessages = response.data.messages;
        setHasMore(response.data.pagination.has_more);
        
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
      } else {
        console.error("Failed to load messages:", response.message);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isAuthenticated) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const response = await api.sendChatMessage(chatId, messageText);
      
      if (response.success) {
        // Add user message to the list
        const userMessage = response.data.user_message;
        setMessages(prev => [...prev, userMessage]);

        // Add AI response if it's an AI chat
        if (chatType === "ai" && response.data.ai_response) {
          setMessages(prev => [...prev, response.data.ai_response]);
        }

        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert("Error", response.message || "Gagal mengirim pesan");
        setInputText(messageText); // Restore the message
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Gagal mengirim pesan");
      setInputText(messageText); // Restore the message
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    Alert.alert(
      "Tutup Chat",
      "Apakah Anda yakin ingin menutup chat ini? Chat akan hilang setelah ditutup.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Tutup",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.closeChat(chatId);
              if (response.success) {
                if (chatType === "doctor") {
                  navigation.navigate('ConsultationHistory');
                } else {
                  safeGoBack(navigation, 'Main');
                }
              } else {
                Alert.alert("Error", response.message || "Gagal menutup chat");
              }
            } catch (error) {
              console.error("Error closing chat:", error);
              Alert.alert("Error", "Gagal menutup chat");
            }
          },
        },
      ]
    );
  };

  const endConsultation = async () => {
    Alert.alert(
      "Akhiri Konsultasi",
      "Apakah Anda yakin ingin mengakhiri konsultasi ini? Konsultasi akan ditandai sebagai selesai.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Akhiri",
          style: "destructive",
          onPress: async () => {
            try {
              // Send system message about ending consultation
              const endMessage = "Konsultasi telah diakhiri oleh user. Terima kasih atas kepercayaan Anda.";
              
              const response = await api.sendChatMessage(chatId, endMessage);
              if (response.success) {
                // Add system message to chat
                setMessages(prev => [...prev, {
                  id: Date.now(),
                  sender_type: "system",
                  message: endMessage,
                  message_type: "system",
                  is_read: true,
                  created_at: new Date().toISOString(),
                }]);

                // Close chat after ending consultation
                setTimeout(async () => {
                  try {
                    await api.closeChat(chatId);
                    if (chatType === "doctor") {
                      navigation.navigate('ConsultationHistory');
                    } else {
                      safeGoBack(navigation, 'Main');
                    }
                  } catch (error) {
                    console.error("Error closing chat after ending consultation:", error);
                    if (chatType === "doctor") {
                      navigation.navigate('ConsultationHistory');
                    } else {
                      safeGoBack(navigation, 'Main');
                    }
                  }
                }, 2000);
              } else {
                Alert.alert("Error", "Gagal mengakhiri konsultasi");
              }
            } catch (error) {
              console.error("Error ending consultation:", error);
              Alert.alert("Error", "Gagal mengakhiri konsultasi");
            }
          },
        },
      ]
    );
  };

  const showEndOptions = () => {
    Alert.alert(
      "Selesaikan Chat",
      "Pilih cara untuk menyelesaikan chat:",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Tutup Chat",
          onPress: closeChat,
        },
        {
          text: "Akhiri Konsultasi",
          style: "destructive",
          onPress: endConsultation,
        },
      ]
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated, chatId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender_type === "user";
    const isSystem = message.sender_type === "system";

    if (isSystem) {
      return (
        <View key={message.id} style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{message.message}</Text>
          </View>
        </View>
      );
    }

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            {chatType === "ai" ? (
              <View style={styles.aiAvatar}>
                <Icon name="robot" size={20} color="#E22345" />
              </View>
            ) : doctor?.avatar_url ? (
              <Avatar.Image
                size={32}
                source={{ uri: doctor.avatar_url }}
              />
            ) : (
              <Avatar.Text
                size={32}
                label={doctor?.name?.charAt(0) || "D"}
                style={styles.doctorAvatar}
              />
            )}
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isUser
              ? { backgroundColor: theme.colors.primary }
              : { backgroundColor: "#F3F4F6" },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser
                ? { color: "#FFFFFF" }
                : { color: theme.colors.onBackground },
            ]}
          >
            {message.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isUser
                ? { color: "rgba(255,255,255,0.7)" }
                : { color: "#9CA3AF" },
            ]}
          >
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (chatType === "doctor") {
                // Untuk chat dengan dokter, kembali ke riwayat konsultasi
                navigation.navigate('ConsultationHistory');
              } else {
                // Untuk chat AI, kembali ke halaman sebelumnya
                safeGoBack(navigation, 'Main');
              }
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            {chatType === "ai" ? (
              <View style={styles.aiAvatar}>
                <Icon name="robot" size={24} color="#E22345" />
              </View>
            ) : doctor?.avatar_url ? (
              <Avatar.Image
                size={40}
                source={{ uri: doctor.avatar_url }}
              />
            ) : (
              <Avatar.Text
                size={40}
                label={doctor?.name?.charAt(0) || "D"}
                style={styles.doctorAvatar}
              />
            )}
            
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{title}</Text>
              {doctor && (
                <Text style={styles.headerSubtitle}>{doctor.specialization}</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={showEndOptions}
          >
            <Icon name="dots-vertical" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {loading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Memuat pesan...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="chat-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyText}>Belum ada pesan</Text>
              <Text style={styles.emptySubtext}>
                Mulai percakapan dengan mengirim pesan
              </Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ketik pesan..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !sending
                    ? theme.colors.primary
                    : "#E5E7EB",
                },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <Icon name="loading" size={20} color="#9CA3AF" />
              ) : (
                <Icon
                  name="send"
                  size={20}
                  color={inputText.trim() && !sending ? "#FFFFFF" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorAvatar: {
    backgroundColor: "#E22345",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessage: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: "80%",
  },
  systemMessageText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  otherMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatDetailScreen; 