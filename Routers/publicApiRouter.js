const express = require("express");
const router = express.Router();
const {
  createOrderPublic,
  updateOrderPublic,
  getOrderPublic,
  listOrdersPublic,
} = require("../controller/publicOrderController");
const {
  apiKeyAuth,
  requirePermission,
} = require("../middleware/apiKeyMiddleware");

// All routes require API key authentication
router.post(
  "/orders",
  apiKeyAuth,
  requirePermission("order:create"),
  createOrderPublic
);

router.put(
  "/orders/:orderId",
  apiKeyAuth,
  requirePermission("order:update"),
  updateOrderPublic
);

router.get(
  "/orders/:orderId",
  apiKeyAuth,
  requirePermission("order:read"),
  getOrderPublic
);

router.get(
  "/orders",
  apiKeyAuth,
  requirePermission("order:read"),
  listOrdersPublic
);

module.exports = router;
