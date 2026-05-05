import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const buildingSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    inviteCode: { type: String, unique: true, sparse: true }, // کد دعوت یکتا
  },
  { timestamps: true },
);

function generateInviteCode() {
  if (!this.inviteCode) {
    this.inviteCode = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

buildingSchema.pre("save", generateInviteCode);
const Building = models.Building || model("Building", buildingSchema);
export default Building;
