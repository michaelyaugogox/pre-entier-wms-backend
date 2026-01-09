const ApiKey = require("../models/ApiKey");
const logActivity = require("../libs/logger");

// Create a new API key
const createApiKey = async (req, res) => {
  try {
    const { name, description, permissions, expiresAt } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Generate a unique API key
    const key = ApiKey.generateKey();

    const newApiKey = new ApiKey({
      name,
      description,
      key,
      user: userId,
      permissions: permissions || ["order:create", "order:update", "order:read"],
      expiresAt: expiresAt || null,
    });

    await newApiKey.save();

    await logActivity({
      action: "Create API Key",
      description: `API key "${name}" was created.`,
      entity: "apiKey",
      entityId: newApiKey._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "API key created successfully",
      apiKey: {
        id: newApiKey._id,
        name: newApiKey.name,
        key: newApiKey.key, // Only shown once during creation
        description: newApiKey.description,
        permissions: newApiKey.permissions,
        isActive: newApiKey.isActive,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt,
      },
      warning: "Store this API key securely. It won't be shown again.",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error creating API key",
      error: error.message,
    });
  }
};

// Get all API keys for the current user
const getApiKeys = async (req, res) => {
  try {
    const userId = req.user._id;

    const apiKeys = await ApiKey.find({ user: userId })
      .select("-key") // Don't send the actual key
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      apiKeys: apiKeys,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching API keys",
      error: error.message,
    });
  }
};

// Get a single API key by ID
const getApiKeyById = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const userId = req.user._id;

    const apiKey = await ApiKey.findOne({ _id: apiKeyId, user: userId })
      .select("-key")
      .populate("user", "name email");

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    res.status(200).json({
      success: true,
      apiKey: apiKey,
    });
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching API key",
      error: error.message,
    });
  }
};

// Update API key
const updateApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const { name, description, permissions, isActive, expiresAt } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const apiKey = await ApiKey.findOne({ _id: apiKeyId, user: userId });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    // Update allowed fields
    if (name !== undefined) apiKey.name = name;
    if (description !== undefined) apiKey.description = description;
    if (permissions !== undefined) apiKey.permissions = permissions;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt;

    await apiKey.save();

    await logActivity({
      action: "Update API Key",
      description: `API key "${apiKey.name}" was updated.`,
      entity: "apiKey",
      entityId: apiKey._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        description: apiKey.description,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        lastUsedAt: apiKey.lastUsedAt,
        updatedAt: apiKey.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error updating API key",
      error: error.message,
    });
  }
};

// Revoke/Delete API key
const revokeApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const apiKey = await ApiKey.findOne({ _id: apiKeyId, user: userId });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    await ApiKey.findByIdAndDelete(apiKeyId);

    await logActivity({
      action: "Revoke API Key",
      description: `API key "${apiKey.name}" was revoked.`,
      entity: "apiKey",
      entityId: apiKey._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(200).json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking API key:", error);
    res.status(500).json({
      success: false,
      message: "Error revoking API key",
      error: error.message,
    });
  }
};

module.exports = {
  createApiKey,
  getApiKeys,
  getApiKeyById,
  updateApiKey,
  revokeApiKey,
};
