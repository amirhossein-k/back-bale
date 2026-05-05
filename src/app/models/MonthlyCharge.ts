// models/MonthlyCharge.ts
import mongoose from 'mongoose';

// مدل شارژ ماهانه
const MonthlyChargeSchema = new mongoose.Schema({
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
    },
    month: {
        type: Number, // 1-12
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true, // مبلغ کل شارژ ماه
    },
    dueDate: {
        type: Date,
        required: true, // مهلت پرداخت
    },
    status: {
        type: String,
        enum: ['pending', 'partial', 'completed'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// مدل پرداخت هر عضو
const PaymentSchema = new mongoose.Schema({
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
    },
    chargeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MonthlyCharge',
        required: true,
    },
    userId: {
        type: String, // userId از بله/تلگرام
        required: true,
    },
    username: String,
    fullName: String,
    unitNumber: String, // شماره واحد
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'receipt', 'cash', 'card'],
        default: 'receipt',
    },
    // تغییرات در فیلدهای مربوط به رسید:
    fileId: { // اضافه شده: file_id از بله
        type: String,
        index: true,
    },
    fileUrl: { // اضافه شده: لینک مستقیم دانلود از بله
        type: String,
    },
    receiptText: String, // تغییر نام: receiptText → caption
    caption: { // اضافه شده: متن همراه عکس
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
    paidAt: {
        type: Date,
        default: Date.now,
    },
    verifiedBy: String, // ادمینی که تایید کرده
    verifiedAt: Date,
    // فیلدهای اضافی برای مدیریت:
    chatId: { // اضافه شده: chat_id مبدأ ارسال
        type: Number,
    },
    adminNote: { // اضافه شده: توضیحات اداری
        type: String,
    },

    // timestamps:
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Middleware برای به‌روزرسانی updatedAt
PaymentSchema.pre('save', function () {
    this.updatedAt = new Date();

});

export const MonthlyCharge = mongoose.models.MonthlyCharge || mongoose.model('MonthlyCharge', MonthlyChargeSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
