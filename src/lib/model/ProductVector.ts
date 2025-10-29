import mongoose from "mongoose";

const ProductVectorSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: String,
  description: String,
  vector: [Number],
});

// Prevent model overwrite errors in dev
export default mongoose.models.ProductVector ||
  mongoose.model("ProductVector", ProductVectorSchema);
