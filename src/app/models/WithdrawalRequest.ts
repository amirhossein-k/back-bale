// models/WithdrawalRequest.ts
import mongoose, { Schema, Document } from 'mongoose';
// برای ثبت درخواست‌های برداشت (جدا از جدول کمیسیون‌ها):


export interface IWithdrawalRequest extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    cardNumber: string;
    fullName?: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawalRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        cardNumber: { type: String, required: true },
        fullName: { type: String },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'rejected'],
            default: 'pending',
        },
        adminNote: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.WithdrawalRequest ||
    mongoose.model<IWithdrawalRequest>('WithdrawalRequest', withdrawalSchema);
