require("dotenv").config();
const { sequelize, syncDatabase } = require("../config/database");
const { User, HealthData, Assessment } = require("../models");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Force sync to recreate tables
    await syncDatabase(true);

    // Create sample users
    const users = await User.bulkCreate([
      {
        name: "John Doe",
        email: "john@example.com",
        password: await bcrypt.hash("password123", 10),
        phone: "+1234567890",
        date_of_birth: "1990-05-15",
        gender: "male",
        height: 175.5,
        weight: 70.2,
        activity_level: "moderately_active",
        health_goals: ["lose_weight", "build_muscle", "improve_cardio"],
        medical_history: {
          conditions: ["hypertension"],
          medications: ["lisinopril"],
          allergies: ["penicillin"],
        },
        preferences: {
          notifications: true,
          privacy: "private",
          language: "en",
        },
        points: 150,
        streak_days: 7,
        is_active: true,
        email_verified: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 10),
        phone: "+1234567891",
        date_of_birth: "1988-12-20",
        gender: "female",
        height: 162.0,
        weight: 55.8,
        activity_level: "very_active",
        health_goals: ["maintain_weight", "improve_flexibility"],
        medical_history: {
          conditions: [],
          medications: [],
          allergies: [],
        },
        preferences: {
          notifications: true,
          privacy: "public",
          language: "en",
        },
        points: 320,
        streak_days: 15,
        is_active: true,
        email_verified: true,
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        password: await bcrypt.hash("password123", 10),
        phone: "+1234567892",
        date_of_birth: "1995-08-10",
        gender: "male",
        height: 180.0,
        weight: 85.0,
        activity_level: "lightly_active",
        health_goals: ["lose_weight", "improve_health"],
        medical_history: {
          conditions: ["diabetes"],
          medications: ["metformin"],
          allergies: [],
        },
        preferences: {
          notifications: false,
          privacy: "private",
          language: "en",
        },
        points: 75,
        streak_days: 3,
        is_active: true,
        email_verified: true,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample health data
    const healthData = await HealthData.bulkCreate([
      {
        user_id: users[0].id,
        date: new Date(),
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        heart_rate: 72,
        temperature: 36.8,
        oxygen_saturation: 98,
        weight: 70.2,
        height: 175.5,
        bmi: 22.8,
        body_fat: 15.2,
        sleep_duration: 7.5,
        sleep_quality: "good",
        deep_sleep: 2.1,
        rem_sleep: 1.8,
        steps: 8500,
        calories_burned: 2100,
        active_minutes: 45,
        exercise_minutes: 30,
        custom_metrics: {
          water_intake: 2.5,
          mood: "happy",
          stress_level: "low",
        },
        notes: "Feeling great today!",
      },
      {
        user_id: users[1].id,
        date: new Date(),
        blood_pressure_systolic: 115,
        blood_pressure_diastolic: 75,
        heart_rate: 68,
        temperature: 36.6,
        oxygen_saturation: 99,
        weight: 55.8,
        height: 162.0,
        bmi: 21.3,
        body_fat: 18.5,
        sleep_duration: 8.2,
        sleep_quality: "excellent",
        deep_sleep: 2.5,
        rem_sleep: 2.0,
        steps: 12000,
        calories_burned: 1800,
        active_minutes: 60,
        exercise_minutes: 45,
        custom_metrics: {
          water_intake: 3.0,
          mood: "energetic",
          stress_level: "low",
        },
        notes: "Great workout session!",
      },
    ]);

    console.log(`✅ Created ${healthData.length} health data records`);

    // Create sample assessments
    const assessments = await Assessment.bulkCreate([
      {
        user_id: users[0].id,
        type: "health_risk",
        title: "Cardiovascular Health Assessment",
        description: "Assessment to evaluate cardiovascular health risks",
        questions: [
          {
            id: 1,
            question: "Do you have a family history of heart disease?",
            type: "single_choice",
            options: [
              { value: "yes", label: "Yes", score: 10 },
              { value: "no", label: "No", score: 0 },
            ],
          },
          {
            id: 2,
            question: "How often do you exercise?",
            type: "single_choice",
            options: [
              { value: "never", label: "Never", score: 10 },
              { value: "rarely", label: "Rarely", score: 7 },
              { value: "sometimes", label: "Sometimes", score: 4 },
              { value: "regularly", label: "Regularly", score: 0 },
            ],
          },
        ],
        answers: ["no", "sometimes"],
        score: 40,
        result: "moderate_risk",
        recommendations: [
          "Increase physical activity to 150 minutes per week",
          "Monitor blood pressure regularly",
          "Maintain healthy diet",
        ],
        is_completed: true,
        completed_at: new Date(),
        estimated_duration: 10,
        category: "cardiovascular",
        tags: ["heart", "exercise", "prevention"],
      },
      {
        user_id: users[1].id,
        type: "fitness",
        title: "Fitness Level Assessment",
        description: "Assessment to evaluate current fitness level",
        questions: [
          {
            id: 1,
            question: "How many days per week do you exercise?",
            type: "single_choice",
            options: [
              { value: "0", label: "0 days", score: 0 },
              { value: "1-2", label: "1-2 days", score: 3 },
              { value: "3-4", label: "3-4 days", score: 6 },
              { value: "5+", label: "5+ days", score: 10 },
            ],
          },
          {
            id: 2,
            question: "What type of exercise do you prefer?",
            type: "multiple_choice",
            options: [
              { value: "cardio", label: "Cardio", score: 3 },
              { value: "strength", label: "Strength Training", score: 3 },
              { value: "flexibility", label: "Flexibility", score: 2 },
              { value: "sports", label: "Sports", score: 3 },
            ],
          },
        ],
        answers: ["3-4", ["cardio", "strength"]],
        score: 85,
        result: "excellent",
        recommendations: [
          "Maintain current fitness routine",
          "Consider adding variety to workouts",
          "Focus on recovery and rest days",
        ],
        is_completed: true,
        completed_at: new Date(),
        estimated_duration: 8,
        category: "fitness",
        tags: ["exercise", "strength", "cardio"],
      },
    ]);

    console.log(`✅ Created ${assessments.length} assessments`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Sample Data Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Health Data Records: ${healthData.length}`);
    console.log(`- Assessments: ${assessments.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
