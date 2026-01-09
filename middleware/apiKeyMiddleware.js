const ApiKey = require("../models/ApiKey");

// Middleware to authenticate API requests using API key
const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKeyHeader = req.headers["x-api-key"] || req.headers["authorization"];

    if (!apiKeyHeader) {
      return res.status(401).json({
        success: false,
        message: "API key is required. Provide it in 'X-API-Key' header.",
      });
    }

    // Extract key (handle "Bearer <key>" format)
    const apiKeyValue = apiKeyHeader.startsWith("Bearer ")
      ? apiKeyHeader.substring(7)
      : apiKeyHeader;

    // Find the API key in database
    const apiKey = await ApiKey.findOne({ key: apiKeyValue }).populate(
      "user",
      "name email"
    );

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    // Check if API key is valid
    if (!apiKey.isValid()) {
      return res.status(401).json({
        success: false,
        message: apiKey.isActive
          ? "API key has expired"
          : "API key has been revoked",
      });
    }

    // Update last used timestamp (async, don't wait)
    apiKey.updateLastUsed().catch((err) => {
      console.error("Error updating API key last used:", err);
    });

    // Attach API key and user to request
    req.apiKey = apiKey;
    req.user = apiKey.user;
    req.apiUser = true; // Flag to identify API requests

    next();
  } catch (error) {
    console.error("API key authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Error authenticating API key",
      error: error.message,
    });
  }
};

// Middleware to check if API key has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(403).json({
        success: false,
        message: "API key authentication required",
      });
    }

    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${permission}`,
        availablePermissions: req.apiKey.permissions,
      });
    }

    next();
  };
};

module.exports = {
  apiKeyAuth,
  requirePermission,
};
