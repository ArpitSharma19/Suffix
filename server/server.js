require("dotenv").config();
const app = require("./src/app");
const { connectDB, sequelize } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Sync all models ONCE
    await sequelize.sync(); 
    console.log("Models synchronized.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();