const Order = require("../models/Order");
const logActivity = require("../libs/logger");
const {
  notifyExternalOrderStatus,
} = require("../libs/externalOrderStatusClient");

const createOrder = async (req, res) => {
  try {
    const {
      user,
      Description,
      totalAmount,
      status,
      packages,
      orderId,
      custRefNo,
    } = req.body;

    if (!user) return res.status(400).json({ message: "User ID is required" });
    if (!Description)
      return res.status(400).json({ message: "Description is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });
    if (!totalAmount)
      return res.status(400).json({ message: "Total amount is required" });

    const newOrder = new Order({
      user,
      Description,
      totalAmount,
      status,
      packages: packages || [],
      orderId,
      custRefNo,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error in creating order",
      error: error.message,
      validationErrors: error.errors,
    });
  }
};

const Removeorder = async (req, res) => {
  try {
    const { OrdertId } = req.params;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const Deletedorder = await Order.findByIdAndDelete(OrdertId);

    if (!Deletedorder) {
      return res.status(404).json({ message: "Order is not found!" });
    }

    await logActivity({
      action: "Delete order",
      description: `Order was deleted.`,
      entity: "order",
      entityId: Deletedorder._id,
      userId: userId,
      ipAddress: ipAddress,
    });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting Order", error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Packages and package items are automatically included as embedded documents
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting orders", error: error.message });
  }
};

const updatestatusOrder = async (req, res) => {
  try {
    const { OrderId } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const ipAddress = req.ip;

    const updatedOrder = await Order.findByIdAndUpdate(OrderId, updates, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    await logActivity({
      action: "Update Order",
      description: `Order updated successfully.`,
      entity: "order",
      entityId: updatedOrder._id,
      userId: userId,
      ipAddress: ipAddress,
    });

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
      message: "Order successfully updated",
      order: updatedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
};

const searchOrder = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const searchdata = await Order.find({
      $or: [
        { Desciption: { $regex: query, $options: "i" } },
        { status: { $regex: query, $options: "i" } },
        { "user.name": { $regex: query, $options: "i" } },
      ],
    })
      .populate("user", "name email")
      .lean();

    // Packages and package items are automatically included as embedded documents
    res.json(searchdata);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in search Orders", error: error.message });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(orderStats);
  } catch (error) {}
};

module.exports = {
  createOrder,
  searchOrder,
  updatestatusOrder,
  getOrder,
  Removeorder,
  getOrderStatistics,
};
