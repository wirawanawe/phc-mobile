const express = require("express");
const router = express.Router();
const { Mission, UserMission, User } = require("../models");
const { protect } = require("../middleware/auth");

// Get all available missions
router.get("/", protect, async (req, res) => {
  try {
    const missions = await Mission.findAll({
      where: { is_active: true },
      order: [
        ["difficulty", "ASC"],
        ["title", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error("Error fetching missions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get missions by category
router.get("/category/:category", protect, async (req, res) => {
  try {
    const { category } = req.params;
    const missions = await Mission.findAll({
      where: {
        category,
        is_active: true,
      },
      order: [
        ["difficulty", "ASC"],
        ["title", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error("Error fetching missions by category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's active missions
router.get("/my-missions", protect, async (req, res) => {
  try {
    const userMissions = await UserMission.findAll({
      where: {
        user_id: req.user.id,
        status: ["active", "completed"],
      },
      include: [
        {
          model: Mission,
          as: "mission",
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "type",
            "target_value",
            "unit",
            "points",
            "icon",
            "color",
            "difficulty",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: userMissions,
    });
  } catch (error) {
    console.error("Error fetching user missions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Accept a mission
router.post("/accept/:missionId", protect, async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = req.user.id;

    // Check if mission exists and is active
    const mission = await Mission.findOne({
      where: {
        id: missionId,
        is_active: true,
      },
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: "Mission not found or inactive",
      });
    }

    // Check if user already has this mission
    const existingUserMission = await UserMission.findOne({
      where: {
        user_id: userId,
        mission_id: missionId,
        status: "active",
      },
    });

    if (existingUserMission) {
      return res.status(400).json({
        success: false,
        message: "You already have this mission active",
      });
    }

    // Calculate due date based on mission type
    let dueDate = null;
    const now = new Date();

    switch (mission.type) {
      case "daily":
        dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        break;
      case "weekly":
        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case "monthly":
        dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case "one_time":
        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days default
        break;
    }

    // Create user mission
    const userMission = await UserMission.create({
      user_id: userId,
      mission_id: missionId,
      status: "active",
      progress: 0,
      current_value: 0,
      start_date: now,
      due_date: dueDate,
    });

    const userMissionWithDetails = await UserMission.findOne({
      where: { id: userMission.id },
      include: [
        {
          model: Mission,
          as: "mission",
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "type",
            "target_value",
            "unit",
            "points",
            "icon",
            "color",
            "difficulty",
          ],
        },
      ],
    });

    res.json({
      success: true,
      message: "Mission accepted successfully",
      data: userMissionWithDetails,
    });
  } catch (error) {
    console.error("Error accepting mission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update mission progress
router.put("/progress/:userMissionId", protect, async (req, res) => {
  try {
    const { userMissionId } = req.params;
    const { current_value, notes } = req.body;
    const userId = req.user.id;

    // Find user mission
    const userMission = await UserMission.findOne({
      where: {
        id: userMissionId,
        user_id: userId,
        status: "active",
      },
      include: [
        {
          model: Mission,
          as: "mission",
        },
      ],
    });

    if (!userMission) {
      return res.status(404).json({
        success: false,
        message: "User mission not found",
      });
    }

    // Calculate progress percentage
    const progress = Math.min(
      Math.round((current_value / userMission.mission.target_value) * 100),
      100
    );

    // Check if mission is completed
    let status = "active";
    let completedDate = null;
    let pointsEarned = null;

    if (current_value >= userMission.mission.target_value) {
      status = "completed";
      completedDate = new Date();
      pointsEarned = userMission.mission.points;
    }

    // Update user mission
    await userMission.update({
      current_value,
      progress,
      status,
      completed_date: completedDate,
      points_earned: pointsEarned,
      notes: notes || userMission.notes,
    });

    // If completed, update user points (assuming User model has points field)
    if (status === "completed") {
      const user = await User.findByPk(userId);
      if (user && user.points !== undefined) {
        await user.update({
          points: (user.points || 0) + pointsEarned,
        });
      }
    }

    const updatedUserMission = await UserMission.findOne({
      where: { id: userMissionId },
      include: [
        {
          model: Mission,
          as: "mission",
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "type",
            "target_value",
            "unit",
            "points",
            "icon",
            "color",
            "difficulty",
          ],
        },
      ],
    });

    res.json({
      success: true,
      message:
        status === "completed" ? "Mission completed!" : "Progress updated",
      data: updatedUserMission,
    });
  } catch (error) {
    console.error("Error updating mission progress:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Abandon mission
router.put("/abandon/:userMissionId", protect, async (req, res) => {
  try {
    const { userMissionId } = req.params;
    const userId = req.user.id;

    const userMission = await UserMission.findOne({
      where: {
        id: userMissionId,
        user_id: userId,
        status: "active",
      },
    });

    if (!userMission) {
      return res.status(404).json({
        success: false,
        message: "User mission not found",
      });
    }

    await userMission.update({
      status: "failed",
    });

    res.json({
      success: true,
      message: "Mission abandoned",
    });
  } catch (error) {
    console.error("Error abandoning mission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get mission statistics
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await UserMission.findAll({
      where: { user_id: userId },
      attributes: [
        "status",
        [
          UserMission.sequelize.fn("COUNT", UserMission.sequelize.col("id")),
          "count",
        ],
      ],
      group: ["status"],
    });

    const totalMissions = await UserMission.count({
      where: { user_id: userId },
    });

    const completedMissions = await UserMission.count({
      where: {
        user_id: userId,
        status: "completed",
      },
    });

    const totalPoints = await UserMission.sum("points_earned", {
      where: {
        user_id: userId,
        status: "completed",
      },
    });

    res.json({
      success: true,
      data: {
        totalMissions,
        completedMissions,
        totalPoints: totalPoints || 0,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching mission stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
