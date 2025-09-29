import mongoose, { Schema, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    userId: { type: String, required: true },       // ✅ store as string
    productId: { type: String, required: true },    // ✅ Sanity _id string
    quantity: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

const Cart = models.Cart || mongoose.model("Cart", CartItemSchema);
export default Cart;
