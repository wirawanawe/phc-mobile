const { Mission } = require("../models");
const { sequelize } = require("../config/database");

const missions = [
  // Health Tracking Missions
  {
    title: "Minum Air 8 Gelas",
    description:
      "Minum minimal 8 gelas air putih setiap hari untuk menjaga kesehatan tubuh",
    category: "health_tracking",
    type: "daily",
    target_value: 8,
    unit: "gelas",
    points: 15,
    icon: "water-drop",
    color: "#4FC3F7",
    difficulty: "easy",
  },
  {
    title: "Tidur 8 Jam",
    description: "Tidur minimal 8 jam setiap malam untuk istirahat yang cukup",
    category: "health_tracking",
    type: "daily",
    target_value: 8,
    unit: "jam",
    points: 20,
    icon: "bed",
    color: "#9C27B0",
    difficulty: "medium",
  },
  {
    title: "Jalan Kaki 10.000 Langkah",
    description: "Berjalan kaki minimal 10.000 langkah setiap hari",
    category: "health_tracking",
    type: "daily",
    target_value: 10000,
    unit: "langkah",
    points: 25,
    icon: "walk",
    color: "#4CAF50",
    difficulty: "medium",
  },
  {
    title: "Cek Tekanan Darah",
    description: "Mengukur tekanan darah secara rutin setiap minggu",
    category: "health_tracking",
    type: "weekly",
    target_value: 1,
    unit: "kali",
    points: 30,
    icon: "heart-pulse",
    color: "#F44336",
    difficulty: "easy",
  },

  // Nutrition Missions
  {
    title: "Makan Buah 3 Porsi",
    description: "Konsumsi minimal 3 porsi buah setiap hari",
    category: "nutrition",
    type: "daily",
    target_value: 3,
    unit: "porsi",
    points: 20,
    icon: "fruit",
    color: "#FF9800",
    difficulty: "easy",
  },
  {
    title: "Makan Sayur 4 Porsi",
    description: "Konsumsi minimal 4 porsi sayuran setiap hari",
    category: "nutrition",
    type: "daily",
    target_value: 4,
    unit: "porsi",
    points: 25,
    icon: "leaf",
    color: "#8BC34A",
    difficulty: "medium",
  },
  {
    title: "Sarapan Sehat",
    description: "Sarapan dengan menu sehat setiap pagi",
    category: "nutrition",
    type: "daily",
    target_value: 1,
    unit: "kali",
    points: 15,
    icon: "breakfast",
    color: "#FFC107",
    difficulty: "easy",
  },
  {
    title: "Hindari Makanan Cepat Saji",
    description: "Tidak mengonsumsi makanan cepat saji selama seminggu",
    category: "nutrition",
    type: "weekly",
    target_value: 7,
    unit: "hari",
    points: 50,
    icon: "no-fast-food",
    color: "#795548",
    difficulty: "hard",
  },

  // Fitness Missions
  {
    title: "Push Up 20 Kali",
    description: "Lakukan push up minimal 20 kali setiap hari",
    category: "fitness",
    type: "daily",
    target_value: 20,
    unit: "kali",
    points: 30,
    icon: "push-up",
    color: "#FF5722",
    difficulty: "medium",
  },
  {
    title: "Squat 30 Kali",
    description: "Lakukan squat minimal 30 kali setiap hari",
    category: "fitness",
    type: "daily",
    target_value: 30,
    unit: "kali",
    points: 25,
    icon: "squat",
    color: "#607D8B",
    difficulty: "medium",
  },
  {
    title: "Plank 2 Menit",
    description: "Lakukan plank minimal 2 menit setiap hari",
    category: "fitness",
    type: "daily",
    target_value: 2,
    unit: "menit",
    points: 35,
    icon: "plank",
    color: "#3F51B5",
    difficulty: "hard",
  },
  {
    title: "Jogging 30 Menit",
    description: "Jogging minimal 30 menit setiap hari",
    category: "fitness",
    type: "daily",
    target_value: 30,
    unit: "menit",
    points: 40,
    icon: "run",
    color: "#00BCD4",
    difficulty: "hard",
  },

  // Mental Health Missions
  {
    title: "Meditasi 10 Menit",
    description: "Lakukan meditasi minimal 10 menit setiap hari",
    category: "mental_health",
    type: "daily",
    target_value: 10,
    unit: "menit",
    points: 25,
    icon: "meditation",
    color: "#9C27B0",
    difficulty: "medium",
  },
  {
    title: "Jurnal Harian",
    description: "Menulis jurnal harian untuk refleksi diri",
    category: "mental_health",
    type: "daily",
    target_value: 1,
    unit: "kali",
    points: 20,
    icon: "journal",
    color: "#795548",
    difficulty: "easy",
  },
  {
    title: "Baca Buku 30 Menit",
    description: "Membaca buku minimal 30 menit setiap hari",
    category: "mental_health",
    type: "daily",
    target_value: 30,
    unit: "menit",
    points: 30,
    icon: "book",
    color: "#3F51B5",
    difficulty: "medium",
  },
  {
    title: "Hindari Gadget 1 Jam",
    description: "Tidak menggunakan gadget selama 1 jam sebelum tidur",
    category: "mental_health",
    type: "daily",
    target_value: 1,
    unit: "jam",
    points: 25,
    icon: "no-phone",
    color: "#FF5722",
    difficulty: "hard",
  },

  // Education Missions
  {
    title: "Baca Artikel Kesehatan",
    description: "Membaca artikel kesehatan minimal 1 artikel setiap hari",
    category: "education",
    type: "daily",
    target_value: 1,
    unit: "artikel",
    points: 15,
    icon: "article",
    color: "#2196F3",
    difficulty: "easy",
  },
  {
    title: "Tonton Video Edukasi",
    description: "Menonton video edukasi kesehatan minimal 10 menit",
    category: "education",
    type: "daily",
    target_value: 10,
    unit: "menit",
    points: 20,
    icon: "video",
    color: "#E91E63",
    difficulty: "easy",
  },
  {
    title: "Ikuti Webinar Kesehatan",
    description: "Mengikuti webinar kesehatan minimal 1 kali per bulan",
    category: "education",
    type: "monthly",
    target_value: 1,
    unit: "kali",
    points: 100,
    icon: "webinar",
    color: "#FF9800",
    difficulty: "medium",
  },

  // Consultation Missions
  {
    title: "Konsultasi Dokter",
    description: "Melakukan konsultasi dengan dokter minimal 1 kali per bulan",
    category: "consultation",
    type: "monthly",
    target_value: 1,
    unit: "kali",
    points: 150,
    icon: "doctor",
    color: "#4CAF50",
    difficulty: "medium",
  },
  {
    title: "Cek Kesehatan Rutin",
    description: "Melakukan pemeriksaan kesehatan rutin setiap 6 bulan",
    category: "consultation",
    type: "monthly",
    target_value: 1,
    unit: "kali",
    points: 200,
    icon: "health-check",
    color: "#F44336",
    difficulty: "hard",
  },

  // Daily Habit Missions
  {
    title: "Cuci Tangan 6 Kali",
    description: "Mencuci tangan minimal 6 kali setiap hari",
    category: "daily_habit",
    type: "daily",
    target_value: 6,
    unit: "kali",
    points: 15,
    icon: "hand-wash",
    color: "#00BCD4",
    difficulty: "easy",
  },
  {
    title: "Senyum 10 Kali",
    description: "Tersenyum minimal 10 kali setiap hari",
    category: "daily_habit",
    type: "daily",
    target_value: 10,
    unit: "kali",
    points: 10,
    icon: "smile",
    color: "#FFC107",
    difficulty: "easy",
  },
  {
    title: "Ucapkan Terima Kasih",
    description: "Mengucapkan terima kasih minimal 5 kali setiap hari",
    category: "daily_habit",
    type: "daily",
    target_value: 5,
    unit: "kali",
    points: 10,
    icon: "thank-you",
    color: "#4CAF50",
    difficulty: "easy",
  },
  {
    title: "Bersihkan Rumah 15 Menit",
    description: "Membersihkan rumah minimal 15 menit setiap hari",
    category: "daily_habit",
    type: "daily",
    target_value: 15,
    unit: "menit",
    points: 20,
    icon: "clean",
    color: "#607D8B",
    difficulty: "medium",
  },
];

const seedMissions = async () => {
  try {
    console.log("🌱 Seeding missions...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Sync database
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized.");

    // Clear existing missions
    await Mission.destroy({ where: {} });
    console.log("🗑️  Cleared existing missions.");

    // Insert missions
    const createdMissions = await Mission.bulkCreate(missions);
    console.log(`✅ Created ${createdMissions.length} missions successfully.`);

    console.log("🎉 Mission seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding missions:", error);
    process.exit(1);
  }
};

// Run the seeding
seedMissions();
