import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: { type: String, default: "management" },
    amount: Number,
    orderId: String,
    verified: { type: Boolean, default: false },
    paidAt: Date,
    paygiri: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Purchase ||
  mongoose.model("Purchase", purchaseSchema);
