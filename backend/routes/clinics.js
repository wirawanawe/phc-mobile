const express = require("express");
const router = express.Router();
const { Clinic, Service, Doctor } = require("../models");
const auth = require("../middleware/auth");

// Get all clinics
router.get("/", async (req, res) => {
  try {
    const clinics = await Clinic.findAll({
      where: { is_active: true },
      include: [
        {
          model: Service,
          as: "services",
          where: { is_active: true },
          required: false,
        },
        {
          model: Doctor,
          as: "doctors",
          where: { is_active: true },
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: clinics,
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get clinic by ID with services and doctors
router.get("/:id", async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id, {
      include: [
        {
          model: Service,
          as: "services",
          where: { is_active: true },
          required: false,
          include: [
            {
              model: Doctor,
              as: "doctors",
              where: { is_active: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    console.error("Error fetching clinic:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get services by clinic ID
router.get("/:id/services", async (req, res) => {
  try {
    const services = await Service.findAll({
      where: {
        clinic_id: req.params.id,
        is_active: true,
      },
      include: [
        {
          model: Doctor,
          as: "doctors",
          where: { is_active: true },
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get doctors by clinic ID
router.get("/:id/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: {
        clinic_id: req.params.id,
        is_active: true,
      },
    });

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get doctors by service ID
router.get("/services/:serviceId/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: {
        service_id: req.params.serviceId,
        is_active: true,
      },
    });

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors by service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
