// bot/handlers/chargeHandlers.ts
import { Telegraf, Markup } from 'telegraf';

export const setupChargeHandlers = (bot: Telegraf) => {
    // دکمه ارسال رسید در ربات
    bot.action('send_receipt', async (ctx) => {
        const userId = ctx.from?.id;

        await ctx.reply(
            '📤 *ارسال رسید پرداخت شارژ*\n\n'
            + 'لطفاً تصویر رسید پرداخت را به همراه متن دلخواه ارسال کنید.\n\n'
            + 'روش کار:\n'
            + '۱. تصویر رسید را انتخاب کنید\n'
            + '۲. (اختیاری) یک متن توضیحی بنویسید\n'
            + '۳. ارسال کنید',
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📸 ارسال تصویر', 'upload_receipt')],
                    [Markup.button.callback('🔙 بازگشت', 'back_to_menu')],
                ]),
            }
        );
    });

    // دریافت تصویر رسید
    bot.on('photo', async (ctx) => {
        try {

            const userId = ctx.from?.id?.toString(); // تبدیل به string
            const photos = ctx.message?.photo;

            if (!photos || photos.length === 0) return;

            // دریافت بهترین کیفیت تصویر
            const photo = photos[photos.length - 1];
            const fileId = photo.file_id;

            // دریافت اطلاعات کاربر از دیتابیس
            const userBuilding = await getUserBuilding(userId);

            if (!userBuilding) {
                return ctx.reply('❌ شما عضو هیچ ساختمانی نیستید');
            }

            // دریافت متن همراه (اگر وجود داشته باشد)
            const caption = ctx.message?.caption || '';

            // ذخیره رسید در دیتابیس
            const payment = await PaymentSchema({
                userId,
                buildingId: userBuilding.buildingId,
                fileId,
                caption,
                chatId: ctx.chat?.id,
            });

            await ctx.reply(
                '✅ *رسید شما با موفقیت ثبت شد*\n\n' +
                `📋 کد پیگیری: ${payment._id}\n` +
                `💰 مبلغ: ${amount ? amount.toLocaleString('fa-IR') + ' ریال' : 'تعیین نشده'}\n` +
                '⏳ پس از تایید ادمین به شما اطلاع داده خواهد شد.',
                { parse_mode: 'Markdown' }
            );
            // ارسال نوتیفیکیشن به ادمین‌ها
            await notifyAdmins(userBuilding.buildingId, {
                type: 'new_payment_receipt',
                userId,
                paymentId: payment._id.toString(),
                fileId,
                fileUrl: payment.fileUrl, // اضافه شده
                amount: payment.amount,
                caption: payment.caption,
            });


        } catch (error) {
            console.error('Error in photo handler:', error);
            await ctx.reply('❌ خطا در ثبت رسید. لطفاً دوباره تلاش کنید.');
        }
    });

    // دکمه پرداخت آنلاین (اختیاری)
    bot.action('online_payment', async (ctx) => {
        await ctx.reply(
            '💰 *پرداخت آنلاین شارژ*\n\n'
            + 'برای پرداخت آنلاین، لطفاً مبلغ مورد نظر را وارد کنید:',
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    force_reply: true,
                    selective: true,
                },
            }
        );
    });
};
