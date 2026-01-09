const axios = require("axios");

// Send order update to external system
const sendOrderUpdate = async (orderData) => {
  try {
    const externalApiUrl = process.env.EXTERNAL_API_URL;
    const externalApiKey = process.env.EXTERNAL_API_KEY;

    if (!externalApiUrl) {
      console.warn("EXTERNAL_API_URL not configured. Skipping external API call.");
      return null;
    }

    const payload = {
      orderId: orderData._id || orderData.id,
      user: orderData.user,
      description: orderData.Description,
      product: orderData.Product,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
      packages: orderData.packages || [],
      updatedAt: orderData.updatedAt,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    // Add API key to headers if configured
    if (externalApiKey) {
      headers["X-API-Key"] = externalApiKey;
      // Or use Authorization header if needed
      // headers["Authorization"] = `Bearer ${externalApiKey}`;
    }

    console.log(`Sending order update to external system: ${externalApiUrl}`);

    const response = await axios.post(externalApiUrl, payload, {
      headers,
      timeout: 10000, // 10 second timeout
    });

    console.log("External API response:", response.status, response.data);

    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending order update to external system:", error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("External API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from external API");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up external API request:", error.message);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// Send order creation to external system
const sendOrderCreation = async (orderData) => {
  try {
    const externalApiCreateUrl = process.env.EXTERNAL_API_CREATE_URL || process.env.EXTERNAL_API_URL;
    const externalApiKey = process.env.EXTERNAL_API_KEY;

    if (!externalApiCreateUrl) {
      console.warn("EXTERNAL_API_CREATE_URL not configured. Skipping external API call.");
      return null;
    }

    const payload = {
      orderId: orderData._id || orderData.id,
      user: orderData.user,
      description: orderData.Description,
      product: orderData.Product,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
      packages: orderData.packages || [],
      createdAt: orderData.createdAt,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    if (externalApiKey) {
      headers["X-API-Key"] = externalApiKey;
    }

    console.log(`Sending order creation to external system: ${externalApiCreateUrl}`);

    const response = await axios.post(externalApiCreateUrl, payload, {
      headers,
      timeout: 10000,
    });

    console.log("External API response:", response.status, response.data);

    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending order creation to external system:", error.message);
    
    if (error.response) {
      console.error("External API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendOrderUpdate,
  sendOrderCreation,
};
