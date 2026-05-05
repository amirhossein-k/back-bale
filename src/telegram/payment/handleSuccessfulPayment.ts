// src/app/payment/handleSuccessfulPayment.ts
import User from '@/app/models/User';
import { Telegraf } from 'telegraf';
import { dbConnect } from '@/app/api/mongodb';

export async function handleSuccessfulPayment(userMongoId: string, orderId: string, telegramId: number) {
    await dbConnect();

    const bot = new Telegraf(process.env.BOT_TOKEN!, {
        telegram: {
            apiRoot: 'https://tapi.bale.ai',  // آدرس API بله

        }
    });

    // 1. به‌روزرسانی نقش کاربر در دیتابیس
    await User.findByIdAndUpdate(userMongoId, {
        $set: { role: 'admin' },
    });

    const miniAppUrl = 'https://dev.marloo.shop/dashboard';

    // 3. ارسال پیام موفقیت با دکمه باز کردن مینی‌اپ
    await bot.telegram.sendMessage(telegramId,
        '✅ پرداخت شما با موفقیت انجام شد!\nاکنون می‌توانید از پنل مدیریت استفاده کنید.',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 رفتن به داشبورد مدیریت', web_app: { url: miniAppUrl } }],
                ],
            },
        }
    );

    // 4. (اختیاری) ذخیره orderId برای رهگیری
    console.log(`Payment completed for user ${userMongoId}, orderId: ${orderId}`);
}
