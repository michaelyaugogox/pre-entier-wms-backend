const express = require("express");
const router = express.Router();
const {
  createWebhook,
  getWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
} = require("../controller/webhookController");
const { authmiddleware } = require("../middleware/Authmiddleware");

// All routes require authentication
router.post("/create", authmiddleware, createWebhook);
router.get("/", authmiddleware, getWebhooks);
router.get("/:webhookId", authmiddleware, getWebhookById);
router.put("/:webhookId", authmiddleware, updateWebhook);
router.delete("/:webhookId", authmiddleware, deleteWebhook);

module.exports = router;
