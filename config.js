require("dotenv").config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "production",

  // Database Configuration
  MONGODB_URL: process.env.MONGODB_URL,

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:4000",
};
