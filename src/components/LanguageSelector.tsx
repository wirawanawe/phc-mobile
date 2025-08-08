import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLanguage } from "../contexts/LanguageContext";

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    {
      code: "id",
      name: t("language.indonesian"),
      flag: "🇮🇩",
    },
    {
      code: "en",
      name: t("language.english"),
      flag: "🇺🇸",
    },
  ];

  const handleLanguageChange = async (langCode: "id" | "en") => {
    try {
      await setLanguage(langCode);
      onClose();
      Alert.alert(
        t("common.success"),
        `Language changed to ${langCode === "id" ? "Indonesian" : "English"}`,
        [{ text: t("common.ok") }]
      );
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert(t("common.error"), "Failed to change language");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("language.select")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.selectedLanguage,
                ]}
                onPress={() => handleLanguageChange(lang.code as "id" | "en")}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      language === lang.code && styles.selectedLanguageText,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </View>
                {language === lang.code && (
                  <Icon name="check" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 5,
  },
  languageList: {
    gap: 10,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedLanguage: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  selectedLanguageText: {
    color: "#10B981",
  },
});

export default LanguageSelector;
