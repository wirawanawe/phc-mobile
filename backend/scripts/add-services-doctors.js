require("dotenv").config();
const { Clinic, Service, Doctor } = require("../models");
const { sequelize } = require("../config/database");

const addServicesAndDoctors = async () => {
  try {
    console.log("🌱 Adding services and doctors to existing clinics...");

    // Create services for each clinic
    const services = await Service.bulkCreate([
      // Jakarta Pusat services (clinic_id: 9)
      {
        clinic_id: 9,
        name: "Pemeriksaan Umum",
        description: "Pemeriksaan kesehatan umum oleh dokter",
        duration: 30,
        price: 150000,
        icon: "stethoscope",
        color: "#E22345",
        category: "general",
        is_active: true,
      },
      {
        clinic_id: 9,
        name: "Pemeriksaan Gigi",
        description: "Pemeriksaan dan perawatan gigi",
        duration: 45,
        price: 200000,
        icon: "tooth",
        color: "#3B82F6",
        category: "dental",
        is_active: true,
      },
      {
        clinic_id: 9,
        name: "Pemeriksaan Mata",
        description: "Pemeriksaan kesehatan mata",
        duration: 40,
        price: 180000,
        icon: "eye",
        color: "#10B981",
        category: "eye",
        is_active: true,
      },
      {
        clinic_id: 9,
        name: "Pemeriksaan Jantung",
        description: "Pemeriksaan kesehatan jantung",
        duration: 60,
        price: 300000,
        icon: "heart-pulse",
        color: "#EF4444",
        category: "cardiology",
        is_active: true,
      },
      // Bandung services (clinic_id: 10)
      {
        clinic_id: 10,
        name: "Pemeriksaan Umum",
        description: "Pemeriksaan kesehatan umum oleh dokter",
        duration: 30,
        price: 140000,
        icon: "stethoscope",
        color: "#E22345",
        category: "general",
        is_active: true,
      },
      {
        clinic_id: 10,
        name: "Pemeriksaan Gigi",
        description: "Pemeriksaan dan perawatan gigi",
        duration: 45,
        price: 190000,
        icon: "tooth",
        color: "#3B82F6",
        category: "dental",
        is_active: true,
      },
      // Surabaya services (clinic_id: 11)
      {
        clinic_id: 11,
        name: "Pemeriksaan Umum",
        description: "Pemeriksaan kesehatan umum oleh dokter",
        duration: 30,
        price: 145000,
        icon: "stethoscope",
        color: "#E22345",
        category: "general",
        is_active: true,
      },
      {
        clinic_id: 11,
        name: "Pemeriksaan Gigi",
        description: "Pemeriksaan dan perawatan gigi",
        duration: 45,
        price: 195000,
        icon: "tooth",
        color: "#3B82F6",
        category: "dental",
        is_active: true,
      },
      {
        clinic_id: 11,
        name: "Pemeriksaan Mata",
        description: "Pemeriksaan kesehatan mata",
        duration: 40,
        price: 175000,
        icon: "eye",
        color: "#10B981",
        category: "eye",
        is_active: true,
      },
      // Medan services (clinic_id: 12)
      {
        clinic_id: 12,
        name: "Pemeriksaan Umum",
        description: "Pemeriksaan kesehatan umum oleh dokter",
        duration: 30,
        price: 135000,
        icon: "stethoscope",
        color: "#E22345",
        category: "general",
        is_active: true,
      },
    ]);

    console.log("✅ Services created successfully");

    // Get the created services to get their IDs
    const createdServices = await Service.findAll({
      where: {
        clinic_id: [9, 10, 11, 12],
      },
      order: [
        ["clinic_id", "ASC"],
        ["id", "ASC"],
      ],
    });

    // Create doctors
    const doctors = await Doctor.bulkCreate([
      // Jakarta Pusat doctors (clinic_id: 9)
      {
        clinic_id: 9,
        service_id: createdServices[0].id, // Pemeriksaan Umum Jakarta
        name: "Dr. Sarah Johnson",
        specialization: "Dokter Umum",
        license_number: "SIP.001.2024",
        email: "sarah.johnson@phc.com",
        phone: "+62-812-1234567",
        rating: 4.8,
        total_reviews: 320,
        experience_years: 8,
        bio: "Dokter umum dengan pengalaman 8 tahun di bidang kesehatan keluarga",
        is_active: true,
      },
      {
        clinic_id: 9,
        service_id: createdServices[0].id, // Pemeriksaan Umum Jakarta
        name: "Dr. Ahmad Rahman",
        specialization: "Dokter Umum",
        license_number: "SIP.002.2024",
        email: "ahmad.rahman@phc.com",
        phone: "+62-812-2345678",
        rating: 4.6,
        total_reviews: 280,
        experience_years: 6,
        bio: "Dokter umum dengan fokus pada kesehatan preventif",
        is_active: true,
      },
      {
        clinic_id: 9,
        service_id: createdServices[1].id, // Pemeriksaan Gigi Jakarta
        name: "Dr. Budi Santoso",
        specialization: "Dokter Gigi",
        license_number: "SIP.003.2024",
        email: "budi.santoso@phc.com",
        phone: "+62-812-3456789",
        rating: 4.9,
        total_reviews: 450,
        experience_years: 12,
        bio: "Dokter gigi dengan spesialisasi ortodonti dan estetika",
        is_active: true,
      },
      {
        clinic_id: 9,
        service_id: createdServices[2].id, // Pemeriksaan Mata Jakarta
        name: "Dr. Robert Chen",
        specialization: "Dokter Mata",
        license_number: "SIP.004.2024",
        email: "robert.chen@phc.com",
        phone: "+62-812-4567890",
        rating: 4.8,
        total_reviews: 380,
        experience_years: 10,
        bio: "Dokter mata dengan pengalaman di berbagai rumah sakit terkemuka",
        is_active: true,
      },
      {
        clinic_id: 9,
        service_id: createdServices[3].id, // Pemeriksaan Jantung Jakarta
        name: "Dr. Lisa Wong",
        specialization: "Kardiolog",
        license_number: "SIP.005.2024",
        email: "lisa.wong@phc.com",
        phone: "+62-812-5678901",
        rating: 4.9,
        total_reviews: 520,
        experience_years: 15,
        bio: "Kardiolog dengan spesialisasi penyakit jantung koroner",
        is_active: true,
      },
      // Bandung doctors (clinic_id: 10)
      {
        clinic_id: 10,
        service_id: createdServices[4].id, // Pemeriksaan Umum Bandung
        name: "Dr. Rina Kartika",
        specialization: "Dokter Umum",
        license_number: "SIP.006.2024",
        email: "rina.kartika@phc.com",
        phone: "+62-812-6789012",
        rating: 4.7,
        total_reviews: 290,
        experience_years: 7,
        bio: "Dokter umum dengan pengalaman di klinik keluarga",
        is_active: true,
      },
      {
        clinic_id: 10,
        service_id: createdServices[5].id, // Pemeriksaan Gigi Bandung
        name: "Dr. Hendra Wijaya",
        specialization: "Dokter Gigi",
        license_number: "SIP.007.2024",
        email: "hendra.wijaya@phc.com",
        phone: "+62-812-7890123",
        rating: 4.5,
        total_reviews: 220,
        experience_years: 5,
        bio: "Dokter gigi dengan fokus pada perawatan gigi anak",
        is_active: true,
      },
      // Surabaya doctors (clinic_id: 11)
      {
        clinic_id: 11,
        service_id: createdServices[6].id, // Pemeriksaan Umum Surabaya
        name: "Dr. Maria Garcia",
        specialization: "Dokter Umum",
        license_number: "SIP.008.2024",
        email: "maria.garcia@phc.com",
        phone: "+62-812-8901234",
        rating: 4.7,
        total_reviews: 310,
        experience_years: 9,
        bio: "Dokter umum dengan pengalaman di bidang kesehatan kerja",
        is_active: true,
      },
      {
        clinic_id: 11,
        service_id: createdServices[7].id, // Pemeriksaan Gigi Surabaya
        name: "Dr. David Kim",
        specialization: "Dokter Gigi",
        license_number: "SIP.009.2024",
        email: "david.kim@phc.com",
        phone: "+62-812-9012345",
        rating: 4.6,
        total_reviews: 260,
        experience_years: 8,
        bio: "Dokter gigi dengan spesialisasi bedah mulut",
        is_active: true,
      },
      {
        clinic_id: 11,
        service_id: createdServices[8].id, // Pemeriksaan Mata Surabaya
        name: "Dr. Siti Aminah",
        specialization: "Dokter Mata",
        license_number: "SIP.010.2024",
        email: "siti.aminah@phc.com",
        phone: "+62-812-0123456",
        rating: 4.8,
        total_reviews: 340,
        experience_years: 11,
        bio: "Dokter mata dengan pengalaman di berbagai klinik mata",
        is_active: true,
      },
      // Medan doctors (clinic_id: 12)
      {
        clinic_id: 12,
        service_id: createdServices[9].id, // Pemeriksaan Umum Medan
        name: "Dr. Joko Widodo",
        specialization: "Dokter Umum",
        license_number: "SIP.011.2024",
        email: "joko.widodo@phc.com",
        phone: "+62-812-1234568",
        rating: 4.5,
        total_reviews: 180,
        experience_years: 6,
        bio: "Dokter umum dengan pengalaman di klinik kesehatan",
        is_active: true,
      },
    ]);

    console.log("✅ Doctors created successfully");
    console.log("🎉 All services and doctors added successfully!");
  } catch (error) {
    console.error("❌ Error adding services and doctors:", error);
  } finally {
    await sequelize.close();
  }
};

// Run the function
addServicesAndDoctors();
