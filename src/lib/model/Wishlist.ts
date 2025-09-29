import mongoose, { Schema, models } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

const Wishlist = models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
export default Wishlist;
