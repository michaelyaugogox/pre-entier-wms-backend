const Order = require("../models/Order");
const ProductModel = require("../models/Product");

// Create order via public API
const createOrderPublic = async (req, res) => {
  try {
    const { user, Description, Product, status, packages } = req.body;
    const apiUser = req.user; // User associated with API key

    // Use the API key's user if user is not provided
    const orderUser = user || apiUser._id;

    if (!Description) {
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

    if (!Product?.product) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!Product?.price) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    if (!Product?.quantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const { product, price, quantity } = Product;
    const totalOrderAmount = price * quantity;

    const productRecord = await ProductModel.findById(product);
    if (!productRecord) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (productRecord.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient product quantity",
        available: productRecord.quantity,
        requested: quantity,
      });
    }

    productRecord.quantity -= quantity;
    await productRecord.save();

    const newOrder = new Order({
      user: orderUser,
      Description,
      Product,
      totalAmount: totalOrderAmount,
      status,
      packages: packages || [],
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: newOrder._id,
        user: newOrder.user,
        Description: newOrder.Description,
        Product: newOrder.Product,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        packages: newOrder.packages,
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

    if (updates.Product && !Array.isArray(updates.Product)) {
      const { price, quantity } = updates.Product;
      if (price && quantity) {
        updates.totalAmount = price * quantity;
      }
    } else if (updates.Product && Array.isArray(updates.Product)) {
      updates.totalAmount = updates.Product.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
    }

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

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: {
        id: updatedOrder._id,
        user: updatedOrder.user,
        Description: updatedOrder.Description,
        Product: updatedOrder.Product,
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        packages: updatedOrder.packages,
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
      .populate("Product.product", "name price")
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
      .populate("Product.product", "name price")
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
