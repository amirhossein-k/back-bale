import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
