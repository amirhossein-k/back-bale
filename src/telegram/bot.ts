// app\telegram\bot.ts
import { Telegraf } from "telegraf";
import { startHandler } from "./handlers/start";
import { BuyPlaneHandler } from "./handlers/buy/BuyPlane";

const activeChats = new Map<number, number>();
const editState = new Map<number, "about" | "searching" | "interests" | "name" | "age">();


const bot = new Telegraf(process.env.BOT_TOKEN!, {
    telegram: {
        apiRoot: 'https://tapi.bale.ai',  // آدرس API بله
        // اختیاری: اگر نیاز به proxy دارید
        // agent: new HttpsProxyAgent('http://proxy:port')
    }
});

// ---- استارت و ثبت پروفایل ----
const BOT_TOKEN = process.env.BOT_TOKEN!;

// تابع ارسال پیام به کاربر
// async function sendMessage(chatId, text) {
//     try {
//         const response = await fetch(
//             `https://tapi.bale.ai/bot${BOT_TOKEN}/sendMessage`,
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     chat_id: chatId,
//                     text: text,
//                     parse_mode: "HTML",
//                 }),
//             },
//         );
//         return await response.json();
//     } catch (error) {
//         console.error("Error sending message:", error);
//     }
// }


bot.start(startHandler()); // اینجا هندلر استارت جدید

bot.action('buy_plane', BuyPlaneHandler())
// برای تأیید نهایی فاکتور قبل از پرداخت. اگر مشکلی نیست، پاسخ ok بدهید.
bot.on('pre_checkout_query', async (ctx) => {
    // بررسی payload و تأیید
    await ctx.answerPreCheckoutQuery(true); // یا false با پیام خطا
});
// برای اعمال دسترسی یا ارسال پیام خوش‌آمد پس از موفقیت پرداخت.

bot.on('successful_payment', async (ctx) => {


    // // ایدی کاربر در بله
    const orderId = ctx.message?.successful_payment?.invoice_payload;
    const amount = ctx.message?.successful_payment?.total_amount
    // کد پیگری پرداخت
    const paygiri = ctx.message?.successful_payment.telegram_payment_charge_id
    const message = `✅ پرداخت با موفقیت انجام شد با هزینه${amount}. به پلن ویژه خوش‌آمدید!`
    console.log(`successful_payment || ${ctx.message.successful_payment}`)
    console.log(`💰 پرداخت موفق برای سفارش: ${orderId}`);
    // اعمال دسترسی‌ها به کاربر
    // آدرس مینی‌اپ خود را قرار دهید
    const miniAppUrl = 'https://dev.marloo.shop';
    const dateBuy = ctx.message?.date
    // اگر می‌خواهید userId یا اطلاعات دیگری به مینی‌اپ ارسال کنید
    // const userId = ctx.from?.id;
    const urlWithParams = `${miniAppUrl}?user_id=${orderId}&paygiri=${paygiri}&date=${dateBuy}`;

    return ctx.telegram.sendMessage(orderId!, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'باز کردن پنل مدیریت',
                        web_app: { url: urlWithParams }  // به جای callback_data
                    }
                ],
            ],
        },
    });
});

// هندلر پیام‌های متنی
bot.on('text', (ctx) => {
    console.log(`📨 Message from ${ctx.from.id}: ${ctx.message.text}`);
    ctx.reply(`شما گفتید: ${ctx.message.text}`);
});

// هندلر خطا
bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err);
    ctx.reply('متأسفانه خطایی رخ داد.');
});




export default bot;
export { activeChats };