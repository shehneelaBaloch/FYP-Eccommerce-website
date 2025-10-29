import mongoose, { Schema, models } from "mongoose";

const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
  },
  { _id: false } // no separate ID for embedded address
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // guest checkout supported
    userEmail: { type: String, required: true },

    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true }, // snapshot of product name
        quantity: { type: Number, required: true, default: 1 },
        priceSnapshot: { type: Number, required: true }, // price locked at order time
        imageUrl: { type: String }, // image snapshot
      },
    ],

    address: { type: AddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "Paypal"],
      default: "COD",
    },

    status: {
      type: String,
      enum: ["Pending", "Received", "Cancelled"],
      default: "Pending",
    },

    totalAmount: { type: Number, required: true },

    transactionId: { type: String, default: null }, // for Stripe/PayPal tracking
  },
  { timestamps: true }
);

// Prevent model overwrite errors in dev hot-reload
const Order = models.Order || mongoose.model("Order", OrderSchema);

export default Order;
