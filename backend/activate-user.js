require("dotenv").config();
const { User } = require("./models");
const { sequelize } = require("./config/database");

const activateUser = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const user = await User.findOne({
      where: { email: "wiwawe@phc.com" },
      attributes: ["id", "name", "email", "is_active"],
    });

    console.log("📋 User status:", {
      id: user.id,
      name: user.name,
      email: user.email,
      is_active: user.is_active,
    });

    if (!user.is_active) {
      await User.update(
        { is_active: true },
        { where: { email: "wiwawe@phc.com" } }
      );
      console.log("✅ Account activated");
    } else {
      console.log("✅ Account already active");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
  }
};

activateUser();
