require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "production",
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: [
    "http://localhost:4000",
    "https://entier-wms-demo-backend-9065da238fb4.herokuapp.com",
  ],
  MONGO: {
    URI: process.env.MONGO_URI,
    DATABASE: process.env.MONGO_DATABASE,
    USER: process.env.MONGO_USER,
    PASSWORD: process.env.MONGO_PASSWORD,
  },
};
