const mongoose = require("mongoose");
const config = require("../config");

module.exports = {
  connect: async () => {
    mongoose.connection.on("connected", () =>
      console.log(`connected to mongo database`),
    );
    mongoose.connection.on("open", () => console.log(`mongo connection open`));
    mongoose.connection.on("disconnected", () =>
      console.log(`disconnected from mongo`),
    );
    mongoose.connection.on("reconnected", () =>
      console.log(`reconnected to mongo`),
    );
    mongoose.connection.on("disconnecting", () =>
      console.log(`disconnecting from mongo`),
    );
    mongoose.connection.on("close", () =>
      console.log(`mongo connection close`),
    );

    await mongoose.connect(config.MONGO.URI, {
      user: config.MONGO.USER,
      pass: config.MONGO.PASSWORD,
      dbName: config.MONGO.DATABASE,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  },
};
