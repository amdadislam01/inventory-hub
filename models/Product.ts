import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    threshold: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ['Active', 'Out of Stock'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
