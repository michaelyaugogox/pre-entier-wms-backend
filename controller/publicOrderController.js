const Order = require("../models/Order");
const {
  notifyExternalOrderStatus,
} = require("../libs/externalOrderStatusClient");

// Create order via public API
const createOrderPublic = async (req, res) => {
  try {
    const {
      user,
      description,
      status,
      packages,
      orderId,
      custRefNo,
    } = req.body;
    const apiUser = req.user; // User associated with API key

    // Use the API key's user if user is not provided
    const orderUser = user || apiUser._id;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const newOrder = new Order({
      user: orderUser,
      description,
      status,
      packages: packages || [],
      orderId,
      custRefNo,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: newOrder._id,
        user: newOrder.user,
        description: newOrder.description,
        status: newOrder.status,
        packages: newOrder.packages,
        orderId: newOrder.orderId,
        custRefNo: newOrder.custRefNo,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating order (public API):", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Update order via public API
const updateOrderPublic = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Notify external system if status changed to "completed" (non-blocking)
    if (updatedOrder.status === "completed" && updatedOrder.orderId) {
      notifyExternalOrderStatus(
        updatedOrder.orderId,
        updatedOrder.status
      ).catch((err) => {
        console.error(
          "Failed to notify external system of status change:",
          err
        );
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: {
        id: updatedOrder._id,
        user: updatedOrder.user,
        description: updatedOrder.description,
        status: updatedOrder.status,
        packages: updatedOrder.packages,
        orderId: updatedOrder.orderId,
        custRefNo: updatedOrder.custRefNo,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating order (public API):", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// Get order by ID via public API
const getOrderPublic = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order (public API):", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// List orders via public API
const listOrdersPublic = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
    });
  } catch (error) {
    console.error("Error listing orders (public API):", error);
    res.status(500).json({
      success: false,
      message: "Error listing orders",
      error: error.message,
    });
  }
};

module.exports = {
  createOrderPublic,
  updateOrderPublic,
  getOrderPublic,
  listOrdersPublic,
};
