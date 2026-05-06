// models/MonthlyCharge.ts
import mongoose from 'mongoose';
// مدیر تعریف میکنه
// مدل شارژ ماهانه
const { Schema, model, models } = mongoose;

const month = [
    'far', 'ordi', 'khor', 'tir', 'mor', 'shahr', 'mehr', 'aban', 'azar', 'dey', 'bahman', 'esfand'
]
const MonthlyChargeSchema = new Schema({
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        enum: ['charge', 'electricity', 'water', 'Facilities', 'extra'], //Facilities= امکانات
        index: true
    },
    month: {
        type: String, //ماه
        required: true,
        enum: month,
        index: true
    },
    year: {
        type: Number, //سال
        required: true,
        index: true
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
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    targetMember: {
        type: [String],//telegramId from member 
        index: true,
    }
});

const MonthlyCharge = models.monthlycharge || model("monthlycharge", MonthlyChargeSchema);
export default MonthlyCharge;
// وثتی همه  تارگت ها پرداخت کنند  وضعیت به کامل در می اید
// اگرکسی پرداخت کرد ایدی ان از لیست هدف ممبر ها حذف میشه
// وقتی مدیر شارژ ماهیانه را تعریف میکنه میتونه تعین کنه چه کسانی بدهند در
// targetMember

