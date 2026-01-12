const express = require("express");
const { MongoDBconfig } = require("./libs/mongoconfig");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authrouter = require("./Routers/authRouther");
const orderrouter = require("./Routers/orderRouter");
const notificationrouter = require("./Routers/notificationRouters");
const activityrouter = require("./Routers/activityRouter");
const inventoryrouter = require("./Routers/inventoryRouter");
const salesrouter = require("./Routers/salesRouter");
const supplierrouter = require("./Routers/supplierrouter");
const stocktransactionrouter = require("./Routers/stocktransactionrouter");
const apikeyrouter = require("./Routers/apiKeyRouter");
const webhookrouter = require("./Routers/webhookRouter");
const publicapirouter = require("./Routers/publicApiRouter");

require("dotenv").config();
const PORT = process.env.PORT || 3003;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(morgan("combined"));
app.set("io", io);
app.use(cookieParser());
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

server.listen(PORT, () => {
  MongoDBconfig();
  console.log(`The server is running at port ${PORT}`);
});

module.exports = { io, server };
