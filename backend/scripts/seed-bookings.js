require("dotenv").config();
const { Booking, User, Clinic, Service, Doctor } = require("../models");
const { sequelize } = require("../config/database");

const seedBookings = async () => {
  try {
    console.log("🌱 Seeding sample booking data...");

    // Create a sample user if not exists
    const [user] = await User.findOrCreate({
      where: { email: "demo@phc.com" },
      defaults: {
        name: "Demo User",
        email: "demo@phc.com",
        password: "demo123", // In production, this should be hashed
        phone: "+62-812-1234567",
        is_active: true,
      },
    });

    // Get existing clinics, services, and doctors
    const clinics = await Clinic.findAll();
    const services = await Service.findAll();
    const doctors = await Doctor.findAll();

    if (clinics.length === 0 || services.length === 0 || doctors.length === 0) {
      console.log("❌ Please run seed:clinics first");
      return;
    }

    // Create sample bookings
    const sampleBookings = [
      {
        booking_id: `BK${Date.now()}001`,
        user_id: user.id,
        clinic_id: clinics[0].id, // Jakarta
        service_id: services[0].id, // Pemeriksaan Umum
        doctor_id: doctors[0].id, // Dr. Sarah Johnson
        appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        appointment_time: "10:00:00",
        status: "confirmed",
        total_price: 150000,
        payment_status: "paid",
        notes: "Pemeriksaan rutin",
      },
      {
        booking_id: `BK${Date.now()}002`,
        user_id: user.id,
        clinic_id: clinics[1].id, // Bandung
        service_id: services[5].id, // Pemeriksaan Gigi
        doctor_id: doctors[6].id, // Dr. Hendra Wijaya
        appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        appointment_time: "14:00:00",
        status: "pending",
        total_price: 190000,
        payment_status: "pending",
        notes: "Kontrol gigi",
      },
      {
        booking_id: `BK${Date.now()}003`,
        user_id: user.id,
        clinic_id: clinics[2].id, // Surabaya
        service_id: services[8].id, // Pemeriksaan Mata
        doctor_id: doctors[9].id, // Dr. Siti Aminah
        appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        appointment_time: "11:00:00",
        status: "completed",
        total_price: 175000,
        payment_status: "paid",
        notes: "Pemeriksaan mata rutin",
      },
    ];

    await Booking.bulkCreate(sampleBookings);

    console.log("✅ Sample booking data created successfully!");
    console.log(`📋 Created ${sampleBookings.length} sample bookings`);
  } catch (error) {
    console.error("❌ Error seeding booking data:", error);
  } finally {
    await sequelize.close();
  }
};

seedBookings();
