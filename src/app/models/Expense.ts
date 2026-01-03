// src/app/models/Expense.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
       buildingId: mongoose.Types.ObjectId;
       managerId: mongoose.Types.ObjectId;
       title: string;
       amount: number; // به تومان
       category: 'repair' | 'maintenance' | 'cleaning' | 'utilities' | 'other';
       description?: string;
       date: Date; // تاریخ هزینه
       receiptImage?: string; // آدرس تصویر فیش
       createdAt: Date;
       updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
       buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
       managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
       title: { type: String, required: true },
       amount: { type: Number, required: true, min: 0 },
       category: {
              type: String,
              enum: ['repair', 'maintenance', 'cleaning', 'utilities', 'other'],
              required: true
       },
       description: { type: String },
       date: { type: Date, required: true, default: Date.now },
       receiptImage: { type: String },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

//  قبض‌ها =utilities
// maintenance = تعمیر و نگهداری، سرویس