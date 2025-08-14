import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { safeGoBack } from "../utils/safeNavigation";

const CalculatorScreen = ({ navigation, route }: any) => {
  const { program } = route.params;
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(inputs.weight);
    const height = parseFloat(inputs.height) / 100; // Convert cm to meters

    if (!weight || !height) {
      Alert.alert("Error", "Please enter both weight and height");
      return;
    }

    const bmi = weight / (height * height);
    let category = "";
    let color = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "#3B82F6";
    } else if (bmi < 25) {
      category = "Normal weight";
      color = "#10B981";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "#F59E0B";
    } else {
      category = "Obese";
      color = "#EF4444";
    }

    setResult({
      value: bmi.toFixed(1),
      category,
      color,
      description: `Your BMI is ${bmi.toFixed(
        1
      )}, which indicates ${category.toLowerCase()}.`,
    });
  };

  const calculatePHQ9 = () => {
    const questions = [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself",
      "Trouble concentrating on things",
      "Moving or speaking slowly",
      "Thoughts of self-harm",
    ];

    let totalScore = 0;
    for (let i = 0; i < questions.length; i++) {
      const score = parseInt(inputs[`question${i}`] || "0");
      totalScore += score;
    }

    let severity = "";
    let color = "";
    let recommendation = "";

    if (totalScore <= 4) {
      severity = "Minimal depression";
      color = "#10B981";
      recommendation = "Continue monitoring your mood.";
    } else if (totalScore <= 9) {
      severity = "Mild depression";
      color = "#F59E0B";
      recommendation = "Consider talking to a healthcare provider.";
    } else if (totalScore <= 14) {
      severity = "Moderate depression";
      color = "#F97316";
      recommendation = "Seek professional help for depression.";
    } else if (totalScore <= 19) {
      severity = "Moderately severe depression";
      color = "#EF4444";
      recommendation = "Immediate professional help recommended.";
    } else {
      severity = "Severe depression";
      color = "#DC2626";
      recommendation = "Urgent professional help needed.";
    }

    setResult({
      value: totalScore,
      category: severity,
      color,
      description: recommendation,
    });
  };

  const calculateCalories = () => {
    const weight = parseFloat(inputs.weight);
    const height = parseFloat(inputs.height);
    const age = parseFloat(inputs.age);
    const gender = inputs.gender;
    const activity = inputs.activity;

    if (!weight || !height || !age || !gender || !activity) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    let bmr = 0;
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightly: 1.375,
      moderately: 1.55,
      very: 1.725,
      extra: 1.9,
    };

    const tdee =
      bmr * activityMultipliers[activity as keyof typeof activityMultipliers];
    const maintainWeight = Math.round(tdee);
    const loseWeight = Math.round(tdee - 500);
    const gainWeight = Math.round(tdee + 500);

    setResult({
      value: maintainWeight,
      category: "Daily Calorie Needs",
      color: "#10B981",
      description: `Maintain: ${maintainWeight} cal | Lose: ${loseWeight} cal | Gain: ${gainWeight} cal`,
    });
  };

  const renderCalculator = () => {
    switch (program.title) {
      case "BMI Calculator":
        return (
          <View style={styles.calculatorForm}>
            <Text style={styles.formTitle}>Calculate Your BMI</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your weight"
                keyboardType="numeric"
                value={inputs.weight}
                onChangeText={(value) => handleInputChange("weight", value)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your height"
                keyboardType="numeric"
                value={inputs.height}
                onChangeText={(value) => handleInputChange("height", value)}
              />
            </View>
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculateBMI}
            >
              <Text style={styles.calculateButtonText}>Calculate BMI</Text>
            </TouchableOpacity>
          </View>
        );

      case "PHQ-9 Assessment":
        return (
          <View style={styles.calculatorForm}>
            <Text style={styles.formTitle}>PHQ-9 Depression Screening</Text>
            <Text style={styles.formDescription}>
              Over the last 2 weeks, how often have you been bothered by any of
              the following problems?
            </Text>
            {[
              "Little interest or pleasure in doing things",
              "Feeling down, depressed, or hopeless",
              "Trouble falling or staying asleep, or sleeping too much",
              "Feeling tired or having little energy",
              "Poor appetite or overeating",
              "Feeling bad about yourself",
              "Trouble concentrating on things",
              "Moving or speaking slowly",
              "Thoughts of self-harm",
            ].map((question, index) => (
              <View key={index} style={styles.questionGroup}>
                <Text style={styles.questionText}>{question}</Text>
                <View style={styles.optionsContainer}>
                  {["0", "1", "2", "3"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        inputs[`question${index}`] === option &&
                          styles.optionButtonSelected,
                      ]}
                      onPress={() =>
                        handleInputChange(`question${index}`, option)
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          inputs[`question${index}`] === option &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.optionLabels}>
                  Not at all | Several days | More than half | Nearly every day
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculatePHQ9}
            >
              <Text style={styles.calculateButtonText}>Calculate Score</Text>
            </TouchableOpacity>
          </View>
        );

      case "Calorie Calculator":
        return (
          <View style={styles.calculatorForm}>
            <Text style={styles.formTitle}>Daily Calorie Calculator</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your weight"
                keyboardType="numeric"
                value={inputs.weight}
                onChangeText={(value) => handleInputChange("weight", value)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your height"
                keyboardType="numeric"
                value={inputs.height}
                onChangeText={(value) => handleInputChange("height", value)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                keyboardType="numeric"
                value={inputs.age}
                onChangeText={(value) => handleInputChange("age", value)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.optionsContainer}>
                {["male", "female"].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.optionButton,
                      inputs.gender === gender && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleInputChange("gender", gender)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        inputs.gender === gender && styles.optionTextSelected,
                      ]}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level</Text>
              <View style={styles.activityOptions}>
                {[
                  { key: "sedentary", label: "Sedentary" },
                  { key: "lightly", label: "Lightly Active" },
                  { key: "moderately", label: "Moderately Active" },
                  { key: "very", label: "Very Active" },
                  { key: "extra", label: "Extra Active" },
                ].map((activity) => (
                  <TouchableOpacity
                    key={activity.key}
                    style={[
                      styles.activityButton,
                      inputs.activity === activity.key &&
                        styles.activityButtonSelected,
                    ]}
                    onPress={() => handleInputChange("activity", activity.key)}
                  >
                    <Text
                      style={[
                        styles.activityText,
                        inputs.activity === activity.key &&
                          styles.activityTextSelected,
                      ]}
                    >
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculateCalories}
            >
              <Text style={styles.calculateButtonText}>Calculate Calories</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.comingSoon}>
            <Icon name="construction" size={64} color="#9CA3AF" />
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              This calculator is under development and will be available soon.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => safeGoBack(navigation, 'Main')}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{program.title}</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Program Header */}
        <View style={styles.programHeader}>
          <View
            style={[
              styles.programIcon,
              { backgroundColor: program.color + "20" },
            ]}
          >
            <Icon name={program.icon} size={32} color={program.color} />
          </View>
          <View style={styles.programInfo}>
            <Text style={styles.programTitle}>{program.title}</Text>
            <Text style={styles.programDescription}>{program.description}</Text>
          </View>
        </View>

        {/* Calculator Form */}
        {renderCalculator()}

        {/* Result */}
        {result && (
          <View style={styles.resultContainer}>
            <LinearGradient
              colors={[result.color + "20", result.color + "10"]}
              style={styles.resultCard}
            >
              <Text style={styles.resultTitle}>{result.category}</Text>
              <Text style={[styles.resultValue, { color: result.color }]}>
                {result.value}
              </Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  helpButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  programIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  calculatorForm: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  formDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  questionGroup: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  optionButtonSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  optionLabels: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  activityOptions: {
    gap: 8,
  },
  activityButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  activityButtonSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  activityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  activityTextSelected: {
    color: "#FFFFFF",
  },
  calculateButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  comingSoon: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default CalculatorScreen;
