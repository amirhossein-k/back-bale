// src\hooks\createWithdrawalRequest.ts
import User, { IUser } from "@/app/models/User";
import WithdrawalRequest from "@/app/models/WithdrawalRequest";
import { notifyAdmin } from "@/lib/notifyAdmin";
import { Context } from "telegraf";

export async function createWithdrawalRequest(user: any, chatId: number, ctx: Context) {
    const amount = user.pendingCommission;
    console.log(ctx, 'createWithdrawalRequest')
    // محافظ در برابر نداشتن شماره کارت
    if (!user.cardNumber) {
        await ctx.telegram.sendMessage(chatId, "❌ شماره کارت ثبت نشده است.");
        return;
    }
    // ایجاد درخواست در دیتابیس
    const request = await WithdrawalRequest.create({
        user: user._id,
        amount,
        cardNumber: user.cardNumber,
        fullName: user.fullName,
        status: 'pending',
    });

    // کاهش موجودی (همانند قبل)
    await User.findByIdAndUpdate(user._id, {
        $inc: { pendingCommission: -amount },
    });

    await ctx.telegram.sendMessage(
        chatId,
        `✅ درخواست برداشت شما به مبلغ ${amount.toLocaleString()} تومان ثبت شد.\n`
        + `کد پیگیری: ${request._id}\n`
        + "پس از تأیید ادمین، مبلغ به حساب شما واریز خواهد شد."
    );

    // (اختیاری) اعلام به ادمین در تلگرام
    await notifyAdmin(amount, user.cardNumber!, user.fullName, request._id);
}
