// models/Wallet.ts
import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalDeposited: {
        type: Number,
        default: 0,
    },
    totalWithdrawn: {
        type: Number,
        default: 0,
    },
    lastTransactionAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
