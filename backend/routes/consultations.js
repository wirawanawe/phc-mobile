const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Mock data for consultations
const consultationTypes = [
  {
    id: "general",
    name: "General Health Consultation",
    description: "General health check-up and wellness advice",
    duration: 30,
    price: 50,
    category: "preventive",
    icon: "stethoscope",
    color: "#10B981",
  },
  {
    id: "nutrition",
    name: "Nutrition Consultation",
    description: "Personalized nutrition advice and meal planning",
    duration: 45,
    price: 75,
    category: "nutrition",
    icon: "food-apple",
    color: "#F59E0B",
  },
  {
    id: "fitness",
    name: "Fitness Consultation",
    description: "Exercise program design and fitness assessment",
    duration: 60,
    price: 80,
    category: "fitness",
    icon: "dumbbell",
    color: "#3B82F6",
  },
  {
    id: "mental-health",
    name: "Mental Health Consultation",
    description: "Stress management and mental wellness support",
    duration: 45,
    price: 90,
    category: "mental-health",
    icon: "brain",
    color: "#8B5CF6",
  },
  {
    id: "specialist",
    name: "Specialist Consultation",
    description: "Specialized health consultation with medical specialists",
    duration: 60,
    price: 120,
    category: "specialist",
    icon: "medical-bag",
    color: "#EF4444",
  },
];

const healthcareProviders = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "General Medicine",
    experience: 15,
    rating: 4.8,
    reviews: 127,
    languages: ["English", "Spanish"],
    availability: ["monday", "wednesday", "friday"],
    consultationTypes: ["general", "nutrition"],
    avatar: "SJ",
    bio: "Experienced general practitioner with focus on preventive care and wellness.",
    education: "MD - Harvard Medical School",
    certifications: [
      "Board Certified in Internal Medicine",
      "Nutrition Specialist",
    ],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialization: "Cardiology",
    experience: 12,
    rating: 4.9,
    reviews: 89,
    languages: ["English", "Mandarin"],
    availability: ["tuesday", "thursday", "saturday"],
    consultationTypes: ["specialist"],
    avatar: "MC",
    bio: "Cardiologist specializing in preventive cardiology and heart health.",
    education: "MD - Stanford Medical School",
    certifications: [
      "Board Certified in Cardiology",
      "Fellow of American College of Cardiology",
    ],
  },
  {
    id: "3",
    name: "Coach Lisa Rodriguez",
    specialization: "Fitness & Wellness",
    experience: 8,
    rating: 4.7,
    reviews: 156,
    languages: ["English", "Portuguese"],
    availability: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    consultationTypes: ["fitness", "nutrition"],
    avatar: "LR",
    bio: "Certified personal trainer and nutrition coach with expertise in functional fitness.",
    education: "BS - Exercise Science, NASM Certified",
    certifications: [
      "NASM Certified Personal Trainer",
      "Precision Nutrition Coach",
    ],
  },
  {
    id: "4",
    name: "Dr. Emily Watson",
    specialization: "Psychology",
    experience: 10,
    rating: 4.6,
    reviews: 203,
    languages: ["English"],
    availability: ["monday", "wednesday", "friday", "saturday"],
    consultationTypes: ["mental-health"],
    avatar: "EW",
    bio: "Licensed psychologist specializing in stress management and cognitive behavioral therapy.",
    education: "PhD - Clinical Psychology, UCLA",
    certifications: ["Licensed Clinical Psychologist", "CBT Specialist"],
  },
];

// @route   GET /api/consultations/types
// @desc    Get consultation types
// @access  Private
router.get("/types", async (req, res) => {
  try {
    const category = req.query.category;

    let filteredTypes = [...consultationTypes];

    if (category) {
      filteredTypes = filteredTypes.filter(
        (type) => type.category === category
      );
    }

    res.json({
      success: true,
      data: {
        types: filteredTypes,
        categories: [
          "preventive",
          "nutrition",
          "fitness",
          "mental-health",
          "specialist",
        ],
      },
    });
  } catch (error) {
    console.error("Get consultation types error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/consultations/providers
// @desc    Get healthcare providers
// @access  Private
router.get("/providers", async (req, res) => {
  try {
    const specialization = req.query.specialization;
    const consultationType = req.query.consultationType;
    const availability = req.query.availability;

    let filteredProviders = [...healthcareProviders];

    if (specialization) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.specialization
          .toLowerCase()
          .includes(specialization.toLowerCase())
      );
    }

    if (consultationType) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.consultationTypes.includes(consultationType)
      );
    }

    if (availability) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.availability.includes(availability)
      );
    }

    // Sort by rating (highest first)
    filteredProviders.sort((a, b) => b.rating - a.rating);

    res.json({
      success: true,
      data: {
        providers: filteredProviders,
        specializations: [
          "General Medicine",
          "Cardiology",
          "Fitness & Wellness",
          "Psychology",
        ],
        availability: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    });
  } catch (error) {
    console.error("Get providers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/consultations/providers/:id
// @desc    Get specific healthcare provider
// @access  Private
router.get("/providers/:id", async (req, res) => {
  try {
    const provider = healthcareProviders.find((p) => p.id === req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    // Get available time slots
    const availableSlots = getAvailableTimeSlots(provider);

    res.json({
      success: true,
      data: {
        provider,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Get provider error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/consultations/book
// @desc    Book a consultation
// @access  Private
router.post(
  "/book",
  [
    body("providerId").notEmpty().withMessage("Provider ID is required"),
    body("consultationType")
      .notEmpty()
      .withMessage("Consultation type is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid time format is required (HH:MM)"),
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason cannot exceed 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { providerId, consultationType, date, time, reason } = req.body;

      // Find provider and consultation type
      const provider = healthcareProviders.find((p) => p.id === providerId);
      const consultation = consultationTypes.find(
        (c) => c.id === consultationType
      );

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider not found",
        });
      }

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation type not found",
        });
      }

      // Check if provider offers this consultation type
      if (!provider.consultationTypes.includes(consultationType)) {
        return res.status(400).json({
          success: false,
          message: "Provider does not offer this consultation type",
        });
      }

      // Check availability
      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.toLocaleDateString("en-US", {
        weekday: "lowercase",
      });

      if (!provider.availability.includes(dayOfWeek)) {
        return res.status(400).json({
          success: false,
          message: "Provider is not available on this day",
        });
      }

      // In a real app, you'd check if the time slot is actually available
      const isSlotAvailable = true; // This would be checked against database

      if (!isSlotAvailable) {
        return res.status(400).json({
          success: false,
          message: "This time slot is not available",
        });
      }

      // Create booking
      const booking = {
        id: `booking_${Date.now()}`,
        userId: req.user._id,
        providerId,
        providerName: provider.name,
        consultationType,
        consultationName: consultation.name,
        date: requestedDate,
        time,
        duration: consultation.duration,
        price: consultation.price,
        reason,
        status: "confirmed",
        createdAt: new Date(),
      };

      res.status(201).json({
        success: true,
        message: "Consultation booked successfully",
        data: { booking },
      });
    } catch (error) {
      console.error("Book consultation error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/consultations/bookings
// @desc    Get user's consultation bookings
// @access  Private
router.get("/bookings", async (req, res) => {
  try {
    const status = req.query.status; // upcoming, completed, cancelled
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // In a real app, you'd get this from database
    const mockBookings = [
      {
        id: "booking_1",
        userId: req.user._id,
        providerId: "1",
        providerName: "Dr. Sarah Johnson",
        consultationType: "general",
        consultationName: "General Health Consultation",
        date: new Date("2024-01-20"),
        time: "10:00",
        duration: 30,
        price: 50,
        reason: "Annual health check-up",
        status: "upcoming",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "booking_2",
        userId: req.user._id,
        providerId: "3",
        providerName: "Coach Lisa Rodriguez",
        consultationType: "fitness",
        consultationName: "Fitness Consultation",
        date: new Date("2024-01-10"),
        time: "14:00",
        duration: 60,
        price: 80,
        reason: "Exercise program design",
        status: "completed",
        createdAt: new Date("2024-01-05"),
      },
    ];

    let filteredBookings = [...mockBookings];

    if (status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === status
      );
    }

    // Sort by date (newest first)
    filteredBookings.sort((a, b) => new Date(b.date) - new Date(a.date));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredBookings.length / limit),
          totalItems: filteredBookings.length,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/consultations/bookings/:id/cancel
// @desc    Cancel a consultation booking
// @access  Private
router.put("/bookings/:id/cancel", async (req, res) => {
  try {
    const bookingId = req.params.id;

    // In a real app, you'd find and update the booking in database
    const booking = {
      id: bookingId,
      status: "cancelled",
      cancelledAt: new Date(),
    };

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/consultations/providers/:id/review
// @desc    Review a healthcare provider
// @access  Private
router.post(
  "/providers/:id/review",
  [
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment cannot exceed 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { rating, comment } = req.body;
      const providerId = req.params.id;

      // In a real app, you'd save this to database
      const review = {
        id: `review_${Date.now()}`,
        userId: req.user._id,
        providerId,
        rating,
        comment,
        createdAt: new Date(),
      };

      res.json({
        success: true,
        message: "Review submitted successfully",
        data: { review },
      });
    } catch (error) {
      console.error("Submit review error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Helper functions
const getAvailableTimeSlots = (provider) => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const slotDuration = 30; // 30 minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }

  return slots;
};

module.exports = router;
