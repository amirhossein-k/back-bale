// models/TempPayment.ts
import mongoose from "mongoose";

const TempPaymentSchema = new mongoose.Schema(
       {
              purchaseId: {
                     type: mongoose.Schema.Types.ObjectId,
                     ref: "Purchase",
                     required: true,
              },
              authority: { type: String, required: true, unique: true },
              amount: { type: Number, required: true },
              planId: { type: String, required: true }, // یا ObjectId اگر Plan مدل دارد
       },
       { timestamps: true }
);

// حذف خودکار بعد از ۲۴ ساعت (اختیاری)
TempPaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.TempPayment ||
       mongoose.model("TempPayment", TempPaymentSchema);