const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clinic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointment_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'no_show',
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_by: {
      type: DataTypes.ENUM('user', 'clinic', 'system'),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'isActive', // Specify the exact column name in database
    },
  },
  {
    tableName: 'bookings',
    timestamps: true,
    hooks: {
      beforeCreate: async (booking) => {
        console.log('🔧 BeforeCreate hook triggered');
        if (!booking.booking_id) {
          const timestamp = Date.now().toString();
          const random = Math.random().toString(36).substr(2, 5).toUpperCase();
          booking.booking_id = `BK${timestamp}${random}`;
          console.log('🔧 Generated booking_id:', booking.booking_id);
        }
      },
    },
  },
);

module.exports = Booking;
