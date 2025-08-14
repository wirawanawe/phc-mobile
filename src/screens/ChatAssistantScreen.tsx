import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CustomTheme } from "../theme/theme";
import { safeGoBack } from "../utils/safeNavigation";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAssistantScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI Health Assistant. I'm here to help you with nutrition, fitness, and wellness advice. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAIResponse(inputText),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (
      input.includes("nutrition") ||
      input.includes("diet") ||
      input.includes("food")
    ) {
      return "For optimal nutrition, focus on a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains. Consider consulting with a nutritionist for personalized advice.";
    } else if (
      input.includes("exercise") ||
      input.includes("workout") ||
      input.includes("fitness")
    ) {
      return "Regular exercise is key to good health. Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training twice a week. Start slowly and gradually increase intensity.";
    } else if (input.includes("sleep") || input.includes("rest")) {
      return "Quality sleep is essential for health. Adults should aim for 7-9 hours per night. Establish a regular sleep schedule and create a relaxing bedtime routine.";
    } else if (input.includes("stress") || input.includes("anxiety")) {
      return "Managing stress is important for mental health. Try techniques like deep breathing, meditation, or regular exercise. Don't hesitate to seek professional help if needed.";
    } else if (input.includes("water") || input.includes("hydration")) {
      return "Stay hydrated by drinking 8-10 glasses of water daily. Your needs may vary based on activity level, climate, and overall health.";
    } else {
      return "I'm here to help with your health questions! Feel free to ask about nutrition, exercise, sleep, stress management, or any other health-related topics.";
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: "#F3F4F6" },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser
              ? { color: "#FFFFFF" }
              : { color: theme.colors.onBackground },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            message.isUser
              ? { color: "rgba(255,255,255,0.7)" }
              : { color: "#9CA3AF" },
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E8EAFF"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => safeGoBack(navigation, 'Main')}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.aiAvatar}>
              <Icon name="robot" size={24} color="#E22345" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Health Assistant</Text>
              <Text style={styles.headerSubtitle}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="dots-vertical" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your health question..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim()
                    ? theme.colors.primary
                    : "#E5E7EB",
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Icon
                name="send"
                size={20}
                color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
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
    color: "#10B981",
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
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
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

export default ChatAssistantScreen;
