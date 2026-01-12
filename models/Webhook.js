const mongoose = require("mongoose");

const WebhookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
    },
    events: {
      type: [String],
      default: ["order.completed"],
      enum: ["order.completed", "order.processing", "order.received"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    secret: {
      type: String,
    },
    lastTriggeredAt: {
      type: Date,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Webhook = mongoose.model("Webhook", WebhookSchema);

module.exports = Webhook;
