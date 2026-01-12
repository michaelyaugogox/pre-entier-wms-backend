const axios = require("axios");

// Send order status update to external system when status changes to "completed"
const notifyExternalOrderStatus = async (orderId, status, webhookUrl = null) => {
  try {
    const externalStatusApiUrl = webhookUrl || process.env.EXTERNAL_STATUS_API_URL;
    const externalApiKey = process.env.EXTERNAL_API_KEY;

    if (!externalStatusApiUrl) {
      console.warn("No webhook URL configured. Skipping external status notification.");
      return null;
    }

    const payload = {
      orderId: orderId,
      status: status,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    // Add API key to headers if configured
    if (externalApiKey) {
      headers["X-API-Key"] = externalApiKey;
    }

    console.log(`Notifying external system of order status change: ${orderId} -> ${status}`);

    const response = await axios.post(externalStatusApiUrl, payload, {
      headers,
      timeout: 10000, // 10 second timeout
    });

    console.log("External status notification response:", response.status, response.data);

    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error notifying external system of status change:", error.message);
    
    if (error.response) {
      console.error("External API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from external API");
    } else {
      console.error("Error setting up external API request:", error.message);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  notifyExternalOrderStatus,
};
