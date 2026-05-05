import mongoose, { Schema, Document } from 'mongoose';
// ب) مدل جدید ReferralCommission (برای ثبت تراکنش‌های پورسانت)

export interface IReferralCommission extends Document {
    referrer: mongoose.Types.ObjectId;
    referred: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: Date;
}

const referralCommissionSchema = new Schema<IReferralCommission>({
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ReferralCommission ||
    mongoose.model<IReferralCommission>('ReferralCommission', referralCommissionSchema);
