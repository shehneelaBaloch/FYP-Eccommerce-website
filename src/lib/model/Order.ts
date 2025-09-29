import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        priceSnapshot: { type: Number, required: true }, // price locked at order time
      },
    ],
    status: { type: String, enum: ["pending", "received", "cancelled"], default: "pending" },
    paymentMethod: { type: String, enum: ["COD", "Stripe", "Paypal"], default: "COD" },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", OrderSchema);
export default Order;
