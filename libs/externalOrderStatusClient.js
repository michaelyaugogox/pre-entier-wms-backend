const axios = require("axios");

// Send order status update to external system when status changes to "completed"
const notifyExternalOrderStatus = async (orderId, status, webhookUrl, webhookSecret) => {
  try {
    if (!webhookUrl) {
      console.warn("No webhook URL provided. Skipping external status notification.");
      return null;
    }

    const payload = {
      orderId: orderId,
      status: status,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    // Add webhook secret to headers if provided
    if (webhookSecret) {
      headers["x-webhook-secret"] = webhookSecret;
    }

    console.log(`Notifying external system of order status change: ${orderId} -> ${status}`);

    const response = await axios.post(webhookUrl, payload, {
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
