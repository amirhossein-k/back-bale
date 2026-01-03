import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      // required: true,
    },
    planName: { type: String },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^09\d{9}$/, "شماره تلفن معتبر نیست"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    activationCode: {
      type: String,
      sparse: true,
      unique: true,
      // required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending",
    },
    transactionId: { type: String, default: null },
    paymentGateway: { type: String, default: "aqayepardakht" },
    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    codeYekta: { type: String, unique: true, sparse: true },
    amount: Number,
    verified: { type: Boolean, default: false },
    paygiri: { type: String },
  },
  { timestamps: true },
);

// ایندکس برای جستجوی سریع
purchaseSchema.index({ activationCode: 1 });
purchaseSchema.index({ phoneNumber: 1, status: 1 });
purchaseSchema.index({ codeYekta: 1 }); // ایندکس برای codeYekta

export default mongoose.models.Purchase ||
  mongoose.model("Purchase", purchaseSchema);
