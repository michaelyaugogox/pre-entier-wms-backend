require("dotenv").config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "production",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:4000",

  MONGO: {
    URI: process.env.ORMONGO_RS_URL,
    DATABASE: process.env.MONGO_DATABASE,
    USER: process.env.MONGO_USER,
    PASSWORD: process.env.MONGO_PASSWORD,
  },
};
