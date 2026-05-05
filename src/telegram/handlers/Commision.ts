// src\telegram\handlers\Commision.ts
import { dbConnect } from "@/app/api/mongodb";
import User from "@/app/models/User";
import ReferralCommission from "@/app/models/ReferralCommission";
import { Context } from "telegraf";

export function CommisionHandler() {
    return async (ctx: Context) => {
        try {
            await dbConnect();

            const chatId = ctx.chat?.id;
            const userId = ctx.from?.id;
            if (!chatId) return;

            // یافتن کاربر
            const user = await User.findOne({ telegramId: userId });
            if (!user) {
                return ctx.telegram.sendMessage(chatId, "کاربر یافت نشد.");
            }

            // گرفتن تعداد ارجاع‌ها و جزئیات (اختیاری)
            const totalEarned = user.totalCommission;
            const pending = user.pendingCommission;
            const referredCount = await ReferralCommission.countDocuments({
                referrer: user._id,
                status: { $ne: 'cancelled' }
            });

            const message = `
📊 **آمار کمیسیون شما**
━━━━━━━━━━━━━━━
👥 تعداد دعوت‌ها: ${referredCount}
💰 کل کمیسیون دریافتی: ${totalEarned.toLocaleString()} تومان
💵 موجودی قابل برداشت: ${pending.toLocaleString()} تومان
━━━━━━━━━━━━━━━
در صورت تمایل می‌توانید کل موجودی قابل برداشت خود را دریافت کنید.
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        {
                            text: pending > 0 ? '✅ برداشت موجودی' : '❌ موجودی ندارید',
                            callback_data: pending > 0 ? 'withdraw_confirm' : 'no_op',
                        }
                    ],
                ],
                resize_keyboard: true,
            };

            await ctx.telegram.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            });

        } catch (error) {
            console.error('Commission error:', error);
        }
    };
}
