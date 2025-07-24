const express = require("express");
const router = express.Router();
const { Booking, User, Clinic, Service, Doctor } = require("../models");
const { protect } = require("../middleware/auth");

// Create a new booking
router.post("/", protect, async (req, res) => {
  try {
    const {
      clinic_id,
      service_id,
      doctor_id,
      appointment_date,
      appointment_time,
      notes,
    } = req.body;

    // Get service to calculate price
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Generate booking_id
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const booking_id = `BK${timestamp}${random}`;

    const booking = await Booking.create({
      booking_id,
      user_id: req.user.id,
      clinic_id,
      service_id,
      doctor_id,
      appointment_date,
      appointment_time,
      notes,
      total_price: service.price,
    });

    // Get booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name", "address", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: bookingWithDetails,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all bookings (public endpoint for development)
router.get("/all", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name", "address"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration"],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
      limit: 10, // Limit to 10 bookings for demo
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's bookings (requires authentication)
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        user_id: req.user.id,
        isActive: true, // Only show active bookings
      },
      include: [
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name", "address"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration"],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get booking by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name", "address", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Cancel booking
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const { cancellation_reason } = req.body;

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    await booking.update({
      status: "cancelled",
      cancellation_reason,
      cancelled_at: new Date(),
      cancelled_by: "user",
      isActive: false, // Set to false so it disappears from mobile app
    });

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update booking status (admin only)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await booking.update({ status });

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update payment status
router.patch("/:id/payment", protect, async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update payment status and optionally payment method
    const updateData = { payment_status };
    if (payment_method) {
      updateData.payment_method = payment_method;
    }

    // If payment is confirmed, also update booking status to confirmed
    if (payment_status === "paid") {
      updateData.status = "confirmed";
    }

    await booking.update(updateData);

    // Get updated booking with related data
    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name", "address", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: ["id", "name", "specialization"],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
