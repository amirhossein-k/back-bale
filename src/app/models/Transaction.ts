// models/Transaction.ts
import mongoose from 'mongoose';
// تراکنش
const TransactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
        index: true,

    },
    type: {
        type: String,
        enum: ['charge', 'electricity', 'water', 'Facilities', 'extra'], //Facilities= امکانات
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
    },
    referenceId: String, // شناسه تراکنش در بازو بله
    paymentMethod: {
        type: String,
        enum: ['bale_wallet', 'card', 'bank_transfer'],
    },


    metadata: mongoose.Schema.Types.Mixed,
    completedAt: Date,
    failedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
