import mongoose from "mongoose";

const buildingMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    role: { type: String },
    joinedAt: Date,
  },
  { timestamps: true },
);

// ترکیب یکتا (هر کاربر فقط یکبار عضو یک ساختمان)
buildingMemberSchema.index({ userId: 1, buildingId: 1 }, { unique: true });

export default mongoose.models.BuildingMember ||
  mongoose.model("BuildingMember", buildingMemberSchema);
