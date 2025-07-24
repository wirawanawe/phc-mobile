import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  ProgressBar,
  RadioButton,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTheme } from "../theme/theme";

const AssessmentScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentCategory, setCurrentCategory] = useState("lifestyle");

  const assessmentCategories = [
    {
      id: "lifestyle",
      title: "Lifestyle Assessment",
      description: "Evaluate your daily habits and routines",
      icon: "🏃‍♂️",
      questions: [
        {
          id: "l1",
          question: "How often do you exercise per week?",
          options: ["Never", "1-2 times", "3-4 times", "5+ times"],
        },
        {
          id: "l2",
          question: "How many hours do you sleep per night?",
          options: ["Less than 6 hours", "6-7 hours", "7-8 hours", "8+ hours"],
        },
        {
          id: "l3",
          question: "How would you rate your stress level?",
          options: ["Very Low", "Low", "Moderate", "High", "Very High"],
        },
      ],
    },
    {
      id: "nutrition",
      title: "Nutrition Assessment",
      description: "Assess your eating habits and diet",
      icon: "🥗",
      questions: [
        {
          id: "n1",
          question: "How many meals do you eat per day?",
          options: ["1-2 meals", "3 meals", "4-5 meals", "6+ meals"],
        },
        {
          id: "n2",
          question: "How often do you eat fruits and vegetables?",
          options: ["Rarely", "1-2 times/week", "3-4 times/week", "Daily"],
        },
        {
          id: "n3",
          question: "How much water do you drink daily?",
          options: [
            "Less than 4 glasses",
            "4-6 glasses",
            "6-8 glasses",
            "8+ glasses",
          ],
        },
      ],
    },
    {
      id: "mental",
      title: "Mental Health Assessment",
      description: "Evaluate your mental well-being",
      icon: "🧠",
      questions: [
        {
          id: "m1",
          question: "How often do you feel anxious or worried?",
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        },
        {
          id: "m2",
          question: "How satisfied are you with your work-life balance?",
          options: [
            "Very Dissatisfied",
            "Dissatisfied",
            "Neutral",
            "Satisfied",
            "Very Satisfied",
          ],
        },
        {
          id: "m3",
          question: "Do you have someone to talk to about your problems?",
          options: ["No one", "Few people", "Some people", "Many people"],
        },
      ],
    },
  ];

  const currentCategoryData = assessmentCategories.find(
    (cat) => cat.id === currentCategory
  );
  const currentQuestionData = currentCategoryData?.questions[currentQuestion];

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionData?.id || ""]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (currentCategoryData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to next category or finish
      const currentIndex = assessmentCategories.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentIndex < assessmentCategories.length - 1) {
        setCurrentCategory(assessmentCategories[currentIndex + 1].id);
        setCurrentQuestion(0);
      } else {
        // Assessment complete
        navigation.navigate("Dashboard");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      const currentIndex = assessmentCategories.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentIndex > 0) {
        setCurrentCategory(assessmentCategories[currentIndex - 1].id);
        setCurrentQuestion(
          assessmentCategories[currentIndex - 1].questions.length - 1
        );
      }
    }
  };

  const getProgress = () => {
    const totalQuestions = assessmentCategories.reduce(
      (sum, cat) => sum + cat.questions.length,
      0
    );
    const answeredQuestions = Object.keys(answers).length;
    return answeredQuestions / totalQuestions;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Header */}
        <View style={styles.progressContainer}>
          <Text
            style={[styles.progressText, { color: theme.colors.onBackground }]}
          >
            Assessment Progress
          </Text>
          <ProgressBar
            progress={getProgress()}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text
            style={[styles.progressPercentage, { color: theme.colors.primary }]}
          >
            {Math.round(getProgress() * 100)}% Complete
          </Text>
        </View>

        {/* Category Selection */}
        <View style={styles.categoryContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Assessment Categories
          </Text>
          <View style={styles.categoryGrid}>
            {assessmentCategories.map((category) => (
              <Card
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor:
                      currentCategory === category.id
                        ? theme.colors.primary
                        : theme.customColors.lightGreen,
                  },
                ]}
                onPress={() => {
                  setCurrentCategory(category.id);
                  setCurrentQuestion(0);
                }}
              >
                <Card.Content style={styles.categoryContent}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryTitle,
                      {
                        color:
                          currentCategory === category.id
                            ? theme.colors.onPrimary
                            : theme.customColors.darkGreen,
                      },
                    ]}
                  >
                    {category.title}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Current Question */}
        {currentQuestionData && (
          <Card style={styles.questionCard}>
            <Card.Content>
              <View style={styles.questionHeader}>
                <Text
                  style={[
                    styles.questionNumber,
                    { color: theme.colors.primary },
                  ]}
                >
                  Question {currentQuestion + 1} of{" "}
                  {currentCategoryData?.questions.length}
                </Text>
                <Text
                  style={[styles.categoryName, { color: theme.colors.primary }]}
                >
                  {currentCategoryData?.title}
                </Text>
              </View>

              <Text
                style={[
                  styles.questionText,
                  { color: theme.colors.onBackground },
                ]}
              >
                {currentQuestionData.question}
              </Text>

              <RadioButton.Group
                onValueChange={handleAnswer}
                value={answers[currentQuestionData.id] || ""}
              >
                {currentQuestionData.options.map((option, index) => (
                  <View key={index} style={styles.optionContainer}>
                    <RadioButton.Item
                      label={option}
                      value={option}
                      color={theme.colors.primary}
                      labelStyle={[
                        styles.optionLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    />
                  </View>
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handlePrevious}
              disabled={
                currentQuestion === 0 &&
                currentCategory === assessmentCategories[0].id
              }
              style={[styles.navButton, { borderColor: theme.colors.primary }]}
              labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
            >
              Previous
            </Button>

            <Button
              mode="contained"
              onPress={handleNext}
              disabled={!answers[currentQuestionData?.id || ""]}
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.primary },
              ]}
              labelStyle={styles.buttonLabel}
            >
              {currentQuestion ===
                (currentCategoryData?.questions.length || 0) - 1 &&
              currentCategory ===
                assessmentCategories[assessmentCategories.length - 1].id
                ? "Complete"
                : "Next"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressPercentage: {
    fontSize: 14,
    textAlign: "center",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    marginBottom: 15,
    elevation: 2,
  },
  categoryContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  questionCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 24,
  },
  optionContainer: {
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AssessmentScreen;
