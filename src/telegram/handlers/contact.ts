// src/app/telegram/handlers/contact.ts
import { Context } from 'telegraf';
import User from '@/app/models/User';
import { dbConnect } from '@/app/api/mongodb';

export function contactHandler() {
    return async (ctx: Context) => {
        try {
            // شماره تلفن
            const contact = (ctx.message as any).contact;
            if (!contact || !contact.user_id) return;
            await dbConnect();

            // به‌روزرسانی شماره تلفن کاربر
            await User.findOneAndUpdate(
                { telegramId: contact.user_id },
                { $set: { phoneNumber: contact.phone_number } },
                { upsert: true, returnDocument: 'after' }
            );

            await ctx.reply('✅ شماره تلفن شما با موفقیت ثبت شد. اکنون مدیر می‌تواند شما را به ساختمان اضافه کند.');
        } catch (error) {
            console.error(error);
            await ctx.reply('خطایی رخ داد. دوباره تلاش کنید.');
        }
    };
}
