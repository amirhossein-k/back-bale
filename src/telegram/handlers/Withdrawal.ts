import { dbConnect } from "@/app/api/mongodb";
import User from "@/app/models/User";
import { createWithdrawalRequest } from "@/hooks/createWithdrawalRequest";
import { Context } from "telegraf";

export function WithdrawalHandler() {
    return async (ctx: Context) => {
        try {
            await dbConnect();
            const chatId = ctx.chat?.id;
            const userId = ctx.from?.id;
            if (!chatId) return;

            const user = await User.findOne({ telegramId: userId });
            if (!user) return ctx.telegram.sendMessage(chatId, "کاربر یافت نشد");

            if (user.pendingCommission <= 0) {
                return ctx.telegram.sendMessage(chatId, "موجودی قابل برداشتی ندارید.");
            }
            console.log('WithdrawalHandler')
            // اگر قبلاً شماره کارت ثبت نکرده، از او بخواهیم
            if (!user.cardNumber) {
                await User.findByIdAndUpdate(user._id, { botState: 'awaiting_card' });
                return ctx.telegram.sendMessage(
                    chatId,
                    "💳 لطفاً شماره کارت خود را به همراه نام صاحب حساب به صورت زیر ارسال کنید:\n\n"
                    + "مثال:\n"
                    + "6037991123456789\nعلیرضا محمدی"
                );
            } else {

                await createWithdrawalRequest(user, chatId, ctx);
            }

            // اگر شماره کارت دارد، مستقیماً درخواست برداشت ایجاد می‌کنیم
            // (اختیاری: می‌توانیم تأیید نهایی بخواهیم)

        } catch (error) {
            console.error(error);
            await ctx.telegram.sendMessage(ctx.chat?.id!, "خطا رخ داد.");
        }
    };
}
