import { dbConnect } from '@/app/api/mongodb';
import ReferralCommission from '@/app/models/ReferralCommission';
import User from '@/app/models/User';
import { NextRequest, NextResponse } from 'next/server';

// در این بخش، API مخصوص درخواست برداشت پورسانت (یا تکمیل برداشت) را طراحی می‌کنیم. بر اساس درخواست شما، این API باید pendingCommission کاربر را کاهش دهد و وضعیت کمیسیون‌های مربوطه را به paid تغییر دهد.


export async function POST(req: NextRequest) {
    try {
        // ------------------ دریافت اطلاعات کاربر ------------------
        const body = await req.json();
        const { telegramId, amount } = body;

        if (!telegramId) {
            return NextResponse.json(
                { error: 'telegramId الزامی است' },
                { status: 400 }
            );
        }

        await dbConnect();

        // ------------------ یافتن کاربر ------------------
        const user = await User.findOne({ telegramId });
        if (!user) {
            return NextResponse.json(
                { error: 'کاربر یافت نشد' },
                { status: 404 }
            );
        }

        // ------------------ تعیین مبلغ برداشت ------------------
        let withdrawAmount = amount || user.pendingCommission; // پیش‌فرض: کل مبلغ pending
        // اطمینان از اینکه مبلغ از pending بیشتر نباشد
        if (withdrawAmount > user.pendingCommission) {
            return NextResponse.json(
                { error: 'مبلغ درخواستی بیشتر از موجودی قابل برداشت است' },
                { status: 400 }
            );
        }
        if (withdrawAmount <= 0) {
            return NextResponse.json(
                { error: 'مبلغ برداشت باید بزرگتر از صفر باشد' },
                { status: 400 }
            );
        }

        // ------------------ به‌روزرسانی کاربر (اتمیک) ------------------
        // با استفاده از findOneAndUpdate و شرط کافی بودن موجودی
        const updatedUser = await User.findOneAndUpdate(
            {
                telegramId,
                pendingCommission: { $gte: withdrawAmount }, // شرط اتمیک
            },
            {
                $inc: { pendingCommission: -withdrawAmount },
            },
            { new: true }
        );

        if (!updatedUser) {
            // اگر شرط برقرار نباشد (مثلاً هم‌زمان درخواست دیگری اجرا شده)
            return NextResponse.json(
                { error: 'موجودی ناکافی یا خطای هم‌زمانی. لطفاً دوباره تلاش کنید.' },
                { status: 409 }
            );
        }

        // ------------------ به‌روزرسانی وضعیت کمیسیون‌ها ------------------
        // دریافت لیست کمیسیون‌های pending این کاربر (به ترتیب قدیم به جدید)
        const pendingCommissions = await ReferralCommission.find({
            referrer: user._id,
            status: 'pending',
        }).sort({ createdAt: 1 }); // FIFO

        let remaining = withdrawAmount;
        const toUpdate: string[] = [];

        for (const commission of pendingCommissions) {
            if (remaining <= 0) break;
            toUpdate.push(commission._id.toString());
            remaining -= commission.amount;
        }

        // اگر جمع کمیسیون‌ها کمتر از مبلغ برداشت باشد (نباید پیش بیاید چون pendingCommission دقیق است)
        if (remaining > 0) {
            // ریورس کردن تغییرات کاربر (اختیاری)
            await User.findByIdAndUpdate(user._id, {
                $inc: { pendingCommission: withdrawAmount },
            });
            return NextResponse.json(
                { error: 'عدم تطابق داده‌ها. لطفاً با پشتیبانی تماس بگیرید.' },
                { status: 500 }
            );
        }

        // علامت‌گذاری کمیسیون‌های انتخابی به عنوان پرداخت‌شده
        await ReferralCommission.updateMany(
            { _id: { $in: toUpdate } },
            { $set: { status: 'paid' } }
        );

        // ------------------ (اختیاری) ثبت لاگ برداشت ------------------
        // می‌توانید یک مدل WithdrawalLog نیز ایجاد کنید

        return NextResponse.json({
            message: 'برداشت با موفقیت انجام شد',
            withdrawnAmount: withdrawAmount,
            remainingPending: updatedUser.pendingCommission,
        });
    } catch (error) {
        console.error('Error in withdrawal:', error);
        return NextResponse.json(
            { error: 'خطای داخلی سرور' },
            { status: 500 }
        );
    }
}

// telegramId (الزامی) و amount (اختیاری، در غیر این صورت کل موجودی) از بدنه درخواست گرفته می‌شود.

// POST /api/referral/withdraw
// Content-Type: application/json

// {
//   "telegramId": 123456789,
//   "amount": 10000
// }
// {
//   "message": "برداشت با موفقیت انجام شد",
//   "withdrawnAmount": 10000,
//   "remainingPending": 5000
// }
