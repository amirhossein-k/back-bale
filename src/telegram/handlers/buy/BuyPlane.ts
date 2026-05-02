// src\telegram\handlers\buy\BuyPlane.ts
import { Context } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN!
const API_URL = `https://tapi.bale.ai/bot${BOT_TOKEN}/sendInvoice`;
const PROVIDER_TOKEN = process.env.PROVIDER_TOKEN!; // توکن درگاه پرداخت از بله

// 1616176632,
export function BuyPlaneHandler() {
    return async (ctx: Context) => {
        try {
            console.log('BuyPlaneHandler')
            // ایدی کاربر در بله
            const chatId = ctx.chat?.id
            if (!chatId) return

            // اطلاعات فاکتور
            const payload = `order_${chatId}_${Date.now()}`
            const invoiceData = {
                chat_id: chatId,
                title: 'خرید پلن A',
                description: "پلن مدیریت A با داشبورد نمایش ساختمان + اعلان از طریق کانال ساختمان",
                payload,
                provider_token: PROVIDER_TOKEN,
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

            // const message = `خرید `
            // // پیام خوش‌آمد
            // await ctx.answerCbQuery();
            // return ctx.reply(
            //     "📜 قوانین استفاده از ربات:\n\n1️⃣ احترام به سایر کاربران الزامی است.\n2️⃣ محتوای نامناسب مجاز نیست.\n3️⃣ تخلف باعث مسدود شدن می‌شود.\n\n✅ با ادامه استفاده، شما قوانین را پذیرفته‌اید."
            // );


        } catch (error) {
            console.error('❌ Error in start handler:', error);
            await ctx.reply('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        }
    };
}
