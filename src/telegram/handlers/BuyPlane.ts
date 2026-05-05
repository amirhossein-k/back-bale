// src\telegram\handlers\buy\BuyPlane.ts
import { dbConnect } from '@/app/api/mongodb';
import User from '@/app/models/User';
import { Context } from 'telegraf';
import Building from '@/app/models/Building'
const BOT_TOKEN = process.env.BOT_TOKEN!
const API_URL = `https://tapi.bale.ai/bot${BOT_TOKEN}/sendInvoice`;
const PROVIDER_TOKEN = process.env.PROVIDER_TOKEN!; // توکن درگاه پرداخت از بله
const AZ_TOKEN = process.env.AZ_TOKEN!; // توکن درگاه پرداخت از بله

// 1616176632,
export function BuyPlaneHandler() {
    return async (ctx: Context) => {
        try {
            await dbConnect()

            console.log('BuyPlaneHandler')
            // ایدی کاربر در بله
            const chatId = ctx.chat?.id
            const userId = ctx.from?.id;

            if (!chatId) return

            // یافتن کاربر در دیتابیس
            const user = await User.findOne({ telegramId: userId });

            if (!user) {
                const keyboard = {
                    keyboard: [

                        [{ text: 'استارت بازو', callback_data: "start" }],
                    ],
                    resize_keyboard: true,
                };
                return ctx.telegram.sendMessage(chatId!, "لطفا روی استارت بازو بزنید", {
                    reply_markup: keyboard,
                });

            }
            // بررسی اینکه آیا کاربر قبلاً ساختمان دارد؟
            const existingBuilding = await Building.findOne({ managerId: user._id });
            if (existingBuilding) {
                return ctx.telegram.sendMessage(chatId!, 'شما قبلاً یک ساختمان دارید و نیازی به خرید مجدد نیست.');

            }

            // ساخت سفارش (درگاه فرضی)
            // اطلاعات فاکتور
            const payload = `order_${chatId}_${Date.now()}`
            const invoiceData = {
                chat_id: chatId,
                title: 'خرید پلن A',
                description: "پلن مدیریت A با داشبورد نمایش ساختمان + اعلان از طریق کانال ساختمان",
                payload,
                provider_token: AZ_TOKEN,
                // currency: 'IRR',
                prices: [
                    // برچسب خدمت یا کالا
                    { label: 'پلن ویژه', amount: 20000 }  // ۵۰,۰۰۰ ریال 
                ],
                // پارامترهای اختیاری:
                // start_parameter: 'buy_plane',
                // need_name: true,
                // need_phone_number: true,
                // need_email: false,
                // is_flexible: false,
            }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            })

            const result = await response.json()

            if (!result.ok) {
                throw new Error(`Bale API error: ${result.description}`);

            }
            console.log('✅ Invoice sent successfully');
            console.log(result, 'result BuyPlaneHandler')

            await ctx.answerCbQuery('لطفاً پرداخت را تکمیل کنید');
            // بعد انتقال می یابد توی action = successful_payment



        } catch (error) {
            console.error('❌ Error in start handler:', error);
            await ctx.reply('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        }
    };
}
