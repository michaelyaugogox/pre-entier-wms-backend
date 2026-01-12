const Webhook = require("../models/Webhook");
const logActivity = require("../libs/logger");

// Create a new webhook
const createWebhook = async (req, res) => {
  try {
    const { name, url, description, events, secret } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const newWebhook = new Webhook({
      name,
      url,
      description,
      user: userId,
      events: events || ["order.completed"],
      secret,
    });

    await newWebhook.save();

    await logActivity({
      action: "Create Webhook",
      description: `Webhook "${name}" was created.`,
      entity: "webhook",
      entityId: newWebhook._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(201).json({
      success: true,
      message: "Webhook created successfully",
      webhook: {
        id: newWebhook._id,
        name: newWebhook.name,
        url: newWebhook.url,
        description: newWebhook.description,
        events: newWebhook.events,
        isActive: newWebhook.isActive,
        secret: newWebhook.secret,
        createdAt: newWebhook.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).json({
      success: false,
      message: "Error creating webhook",
      error: error.message,
    });
  }
};

// Get all webhooks for the current user
const getWebhooks = async (req, res) => {
  try {
    const userId = req.user._id;

    const webhooks = await Webhook.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: webhooks.length,
      webhooks: webhooks,
    });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webhooks",
      error: error.message,
    });
  }
};

// Get a single webhook by ID
const getWebhookById = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const userId = req.user._id;

    const webhook = await Webhook.findOne({ _id: webhookId, user: userId })
      .populate("user", "name email");

    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    res.status(200).json({
      success: true,
      webhook: webhook,
    });
  } catch (error) {
    console.error("Error fetching webhook:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webhook",
      error: error.message,
    });
  }
};

// Update webhook
const updateWebhook = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { name, url, description, events, isActive, secret } = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const webhook = await Webhook.findOne({ _id: webhookId, user: userId });

    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    // Update allowed fields
    if (name !== undefined) webhook.name = name;
    if (url !== undefined) webhook.url = url;
    if (description !== undefined) webhook.description = description;
    if (events !== undefined) webhook.events = events;
    if (isActive !== undefined) webhook.isActive = isActive;
    if (secret !== undefined) webhook.secret = secret;

    await webhook.save();

    await logActivity({
      action: "Update Webhook",
      description: `Webhook "${webhook.name}" was updated.`,
      entity: "webhook",
      entityId: webhook._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(200).json({
      success: true,
      message: "Webhook updated successfully",
      webhook: {
        id: webhook._id,
        name: webhook.name,
        url: webhook.url,
        description: webhook.description,
        events: webhook.events,
        isActive: webhook.isActive,
        secret: webhook.secret,
        lastTriggeredAt: webhook.lastTriggeredAt,
        failureCount: webhook.failureCount,
        updatedAt: webhook.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    res.status(500).json({
      success: false,
      message: "Error updating webhook",
      error: error.message,
    });
  }
};

// Delete webhook
const deleteWebhook = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const webhook = await Webhook.findOne({ _id: webhookId, user: userId });

    if (!webhook) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    await Webhook.findByIdAndDelete(webhookId);

    await logActivity({
      action: "Delete Webhook",
      description: `Webhook "${webhook.name}" was deleted.`,
      entity: "webhook",
      entityId: webhook._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(200).json({
      success: true,
      message: "Webhook deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting webhook",
      error: error.message,
    });
  }
};

module.exports = {
  createWebhook,
  getWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
};
