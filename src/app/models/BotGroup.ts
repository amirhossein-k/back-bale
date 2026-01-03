// models/BotGroup.ts
import mongoose from 'mongoose';

const BotGroupSchema = new mongoose.Schema(
    {
        chatId: {
            type: Number,
            index: true,
            required: true, unique: true
        },
        title: { type: String },
        type: { type: String },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    }
);

export default mongoose.models.BotGroup || mongoose.model('BotGroup', BotGroupSchema);
