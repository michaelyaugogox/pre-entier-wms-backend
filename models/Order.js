const mongoose = require("mongoose");

const PackageItemSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
    },
    sku: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    quantityUnit: {
      type: String,
      enum: ["pieces"],
    },
    grossWeightPerUnit: {
      type: Number,
    },
    weightUnit: {
      type: String,
      enum: ["kg", "lbs"],
    },
    customFieldData: [
      {
        uniqueKey: {
          type: String,
        },
        value: {
          type: String,
        },
        label: {
          type: String,
        },
      },
    ],
  },
  { _id: true }
);

const PackageSchema = new mongoose.Schema(
  {
    displayOrder: {
      type: Number,
    },
    reference: {
      type: String,
    },
    code: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    quantityUnit: {
      type: String,
      enum: ["pieces", "cartons", "pallets"],
    },
    grossWeightPerUnit: {
      type: Number,
    },
    grossWeightSubtotal: {
      type: Number,
    },
    weightUnit: {
      type: String,
      enum: ["kg", "lbs"],
    },
    length: {
      type: Number,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
    dimensionUnit: {
      type: String,
      enum: ["cm", "inch"],
    },
    cbm: {
      type: Number,
    },
    customFieldData: [
      {
        uniqueKey: {
          type: String,
        },
        value: {
          type: String,
        },
        label: {
          type: String,
        },
      },
    ],
    fromWaypointUuid: {
      type: String,
    },
    toWaypointUuid: {
      type: String,
    },
    itemTotalQuantity: {
      type: Number,
    },
    items: [PackageItemSchema],
  },
  { _id: true }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Description: {
      type: String,
      required: true,
    },
    Product: {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "processing", "completed"],
    },

    invoiceUrl: {
      type: String,
    },
    externalOrderId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    custRefNo: {
      type: String,
    },
    packages: [PackageSchema],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
