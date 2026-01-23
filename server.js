const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config");
const authrouter = require("./routers/authRouther");
const orderrouter = require("./routers/orderRouter");
const notificationrouter = require("./routers/notificationRouters");
const activityrouter = require("./routers/activityRouter");
const inventoryrouter = require("./routers/inventoryRouter");
const salesrouter = require("./routers/salesRouter");
const supplierrouter = require("./routers/supplierrouter");
const stocktransactionrouter = require("./routers/stocktransactionrouter");
const apikeyrouter = require("./routers/apiKeyRouter");
const webhookrouter = require("./routers/webhookRouter");
const publicapirouter = require("./routers/publicApiRouter");
const mongo = require("./db/mongo");

async function startServer() {
  try {
    await mongo.connect();
    const app = express();

    app.use(
      cors({
        origin: config.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      }),
    );

    app.use(express.json({ limit: "10mb" }));
    app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
    app.use(cookieParser());

    // Health check endpoint
    app.get("/health", (req, res) => {
      res
        .status(200)
        .json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.use("/api/auth", authrouter);
    app.use("/api/order", orderrouter);
    app.use("/api/notification", notificationrouter);
    app.use("/api/activitylogs", activityrouter(app));
    app.use("/api/inventory", inventoryrouter);
    app.use("/api/sales", salesrouter);
    app.use("/api/supplier", supplierrouter);
    app.use("/api/stocktransaction", stocktransactionrouter);
    app.use("/api/apikeys", apikeyrouter);
    app.use("/api/webhooks", webhookrouter);
    app.use("/api/public", publicapirouter);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);
      res.status(500).json({
        error:
          config.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    });

    const server = app.listen(config.PORT, () => {
      console.log(`The server is running at port ${config.PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully...`);

      server.close(() => {
        console.log("HTTP server closed");
        mongoose.connection.close();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      shutdown("unhandledRejection");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
