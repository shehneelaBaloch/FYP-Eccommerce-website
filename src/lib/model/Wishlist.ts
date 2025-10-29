// lib/model/Wishlist.ts
import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IWishlist extends Document {
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> = models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);
export default Wishlist;