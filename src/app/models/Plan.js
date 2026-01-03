import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // به روز
    description: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: null }, // 'popular' | 'best' | null
  },
  { timestamps: true },
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
