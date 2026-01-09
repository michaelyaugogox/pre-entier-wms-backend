const mongoose = require("mongoose");
const crypto = require("crypto");

const ApiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
    },
    permissions: {
      type: [String],
      default: ["order:create", "order:update", "order:read"],
      enum: ["order:create", "order:update", "order:read", "order:delete"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Generate a secure API key
ApiKeySchema.statics.generateKey = function () {
  return `wms_${crypto.randomBytes(32).toString("hex")}`;
};

// Method to check if key is valid
ApiKeySchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

// Update last used timestamp
ApiKeySchema.methods.updateLastUsed = async function () {
  this.lastUsedAt = new Date();
  await this.save();
};

const ApiKey = mongoose.model("ApiKey", ApiKeySchema);

module.exports = ApiKey;
