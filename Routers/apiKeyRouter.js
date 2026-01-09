const express = require("express");
const router = express.Router();
const {
  createApiKey,
  getApiKeys,
  getApiKeyById,
  updateApiKey,
  revokeApiKey,
} = require("../controller/apiKeyController");
const { authmiddleware } = require("../middleware/Authmiddleware");

// All routes require authentication
router.post("/create", authmiddleware, createApiKey);
router.get("/", authmiddleware, getApiKeys);
router.get("/:apiKeyId", authmiddleware, getApiKeyById);
router.put("/:apiKeyId", authmiddleware, updateApiKey);
router.delete("/:apiKeyId", authmiddleware, revokeApiKey);

module.exports = router;
