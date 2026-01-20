const mongoose = require("mongoose");
const config = require("../config");

module.exports.MongoDBconfig = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("connected to database successfully");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
};
