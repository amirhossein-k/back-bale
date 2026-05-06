// app\telegram\bot.ts
import { Context, Markup, Telegraf } from "telegraf";
import { startHandler } from "./handlers/start";
import { BuyPlaneHandler } from "./handlers/BuyPlane";
import { handleSuccessfulPayment } from "./payment/handleSuccessfulPayment";
import Purchase from "@/app/models/Purchase";
import User from "@/app/models/User";
import { dbConnect } from "@/app/api/mongodb";
import ReferralCommission from "@/app/models/ReferralCommission";
import { KasbHandler } from "./handlers/Kasb";
import { CommisionHandler } from "./handlers/Commision";
import { WithdrawalHandler } from "./handlers/Withdrawal";
import { createWithdrawalRequest } from "@/hooks/createWithdrawalRequest";
import WithdrawalRequest from "@/app/models/WithdrawalRequest";
import BotGroup from "@/app/models/BotGroup";
import { extractAmountFromCaption } from "@/lib/extract";
import BuildingMember from "@/app/models/BuildingMember";
import { sendTelegramNotification } from "@/lib/notifyAdmin";
import { Wallet } from "@/app/models/Wallet";
import { Transaction } from "@/app/models/Transaction";
import MonthlyCharge from "@/app/models/MonthlyCharge";

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

// bot.launch()


bot.start(startHandler()); // اینجا هندلر استارت جدید
bot.action('kasb', KasbHandler())
bot.action('Commission', CommisionHandler())

bot.on('chat_member', async (ctx) => {
    const chat = ctx.chat;
    console.log('chat_member')
    if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup')) return;
    // چک کنیم که تغییر مربوط به خود ربات است
    if (ctx.chatMember.new_chat_member.user.id === ctx.botInfo.id) {
        const status = ctx.chatMember.new_chat_member.status;

        if (status === 'member' || status === 'administrator') {
            await BotGroup.findOneAndUpdate(
                { chatId: chat.id },
                { chatId: chat.id, title: chat.title, type: chat.type },
                { upsert: true }
            );
            console.log(`ربات به گروه ${chat.title} اضافه شد.`);
        } else if (['kicked', 'left'].includes(status)) {
            await BotGroup.findOneAndDelete({ chatId: chat.id });
            console.log(`ربات از گروه ${chat.title} حذف شد.`);
        }
    }
});
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

bot.action(/complete_(.+)/, async (ctx) => {
    console.log(ctx, ' /complete_ ==== ctx')
    const requestId = ctx.match[1];
    console.log(requestId, ' /complete_ ==== requestId')

    const chat = await WithdrawalRequest.findByIdAndUpdate(requestId, { status: "completed" }).populate("user") // یا populate("userId") بسته به نیاز
        .lean()
    console.log(chat.user.telegramId, 'chat.telegramId')
    const chatId = chat.user.telegramId
    await ctx.telegram.sendMessage(
        chatId,
        `واریز شد`
    );

    await ctx.answerCbQuery("✅ وضعیت به پرداخت شده تغییر کرد");
    await ctx.editMessageText("✅ درخواست تأیید شد.", { parse_mode: "Markdown" });
});

bot.action(/reject_(.+)/, async (ctx) => {
    const requestId = ctx.match[1];
    await WithdrawalRequest.findByIdAndUpdate(requestId, { status: "rejected" });
    await ctx.answerCbQuery("❌ درخواست رد شد");
    await ctx.editMessageText("❌ درخواست رد شد.", { parse_mode: "Markdown" });
});


bot.action('buy_plane', BuyPlaneHandler())

const messageHandler = async (ctx: Context) => {
    console.log(`ctx message == ${ctx}`, ctx)

    // --------- برای پرداخت نهایی شده --------------------
    // -------------                        --------------------
    if ((ctx.update as any)?.message?.successful_payment) {

        const message = (ctx.update as any)?.message
        if (!message?.successful_payment) return;
        ///update =>>>> message =>> date : تاریخ 
        const datePay = message?.date
        //update =>>>> message =>>>>>  from :من که پرداخت کردم or  chat
        const userInfoBuyId = message?.from?.id
        //update =>>> successful_payment =>>>> total_amount | invoice_payload: example= order_360594256_1778018078695 | telegram_payment_charge_id : کد پیگیری
        const payment = (ctx.update as any)?.successful_payment
        const paymentInfo = {
            amount: payment?.total_amount,
            invoice_payload: payment?.invoice_payload,
            paygiri: payment?.telegram_payment_charge_id
        }
        // save to database
        // ------------- // مدیر ساختمان را از روی 
        // -------------// buldingmember  پیدا کن
        const telegramId = String(userInfoBuyId);
        // 1-userID
        // const { telegramId } = await User.findOne({ telegramId: userInfoBuyId }).select('telegramId')
        // 2-memberbuildig
        // const { buildingId } = await BuildingMember.findOne({ userId: UserIDFound }).select('buildingId')

        //کیف پولش پیدا میکنیم
        const { buildingId } = await Wallet.findOne({ userId: telegramId }).select('buildingId').lean()
        //  مقدار را به کیف پول مدیر ساختمان واریز میکنیم اما چون  مدیر ربات هنوز پول پرداخت نکرده به مدیر پس وضعیت ان  را 
        // pending یزاریم
        if (!buildingId) {
            throw new Error('کیف پول مقصد وجود ندارد');
        }
        // ۴. بروزرسانی موجودی‌ها

        await Wallet.updateOne(
            { userId: telegramId },
            { $inc: { balance: paymentInfo.amount }, $set: { updatedAt: new Date() } }

        );
        // ۵. ثبت تراکنش
        // نوع ان را باید توی =>> invoice_payload  ==> جا بدیم
        // چون عنوان مختلف تایید پرداخت داریم
        await Transaction.create({
            userId: telegramId,
            buildingId,
            amount: paymentInfo.amount,
            type: 'charge',
            description: 'شارژ ماهیانه',
            status: 'completed',
            paymentMethod: 'bale_wallet',
            referenceId: paymentInfo.paygiri,//کد پیگری
            completedAt: datePay
        })

        await MonthlyCharge.updateOne(
            { buildingId },
            { $pull: { targetMember: telegramId } }
        );

        await ctx.reply(
            `شارژ ماهیانه پرداخت شد\n
                کد پیگیری: ${paymentInfo.paygiri}
                زمان: ${datePay}
                `,
            { parse_mode: 'Markdown' }
        );




    }


    // if(ctx.update)

    // user info
    // گروه ==> (ctx.update as any)?.message?.chat ==>id,type,title
    const updateGroup = (ctx.update as any)?.message?.chat
    console.log(updateGroup, 'updateGroup')
    // read text send
    const updateText = (ctx.update as any)?.message?.text

    // console.log(chatt, 'chatt')
    if ((updateGroup?.type === 'group' || updateGroup?.type === 'supergroup') &&
        //  (payload && payload.startsWith('AddGroup_1'))
        (updateText && updateText.startsWith('AddGroup_1'))
    ) {
        const updateId = (ctx.update as any)?.message?.from?.id
        await dbConnect()
        console.log('grouppp')
        const user = await User.findOne({ telegramId: updateId }).select('_id role');
        // در ربات عضو نیست یعنی اصلا ربات را پلی نداده است
        if (!user) return
        if (user.role === 'admin') {



            const titleGroup = updateGroup?.title || 'بدون عنوان'
            const groupId = updateGroup?.id
            const typeGroup = updateGroup?.type
            // ذخیره گروه
            await BotGroup.findOneAndUpdate(
                { chatId: groupId },
                { chatId: groupId, title: titleGroup, type: typeGroup, adminId: user._id },
                { upsert: true }
            );
            ctx.reply(`تنظیمات بازو فعال شد✅`);



        }
        //     // بررسی کن ببین کسی که پیام میده ادمین است در دیتا بیس من یا نه
    }
    return
}
bot.on('message', messageHandler)

bot.action('withdraw_confirm', WithdrawalHandler())
// برای تأیید نهایی فاکتور قبل از پرداخت. اگر مشکلی نیست، پاسخ ok بدهید.
bot.on('pre_checkout_query', async (ctx) => {
    // بررسی payload و تأیید
    await ctx.answerPreCheckoutQuery(true); // یا false با پیام خطا
});
// برای اعمال دسترسی یا ارسال پیام خوش‌آمد پس از موفقیت پرداخت.

bot.on('successful_payment', async (ctx) => {

    // // ایدی کاربر در بله
    const userId = ctx.chat.id
    // "invoice_payload": "order_1616176632_1777741299714",
    const invoiceId = ctx.message?.successful_payment?.invoice_payload;
    const amount = ctx.message?.successful_payment?.total_amount
    const telegram_payment_charge_id = ctx.message?.successful_payment?.telegram_payment_charge_id
    const combined = `${invoiceId}_${telegram_payment_charge_id}`;

    // کد پیگری پرداخت
    const paygiri = ctx.message?.successful_payment.telegram_payment_charge_id
    if (!invoiceId || !paygiri) {
        console.error('اطلاعات پرداخت ناقص است');
        return;
    }

    const message = `✅ پرداخت با موفقیت انجام شد با هزینه${amount}. به پلن ویژه خوش‌آمدید!`
    console.log(`successful_payment || ${ctx.message.successful_payment}`)
    console.log(`💰 پرداخت موفق برای سفارش: ${userId}`);
    // ✅ 3. پیدا کردن کاربر با telegramId (نه findById)
    const user = await User.findOne({ telegramId: userId });
    if (!user) {
        console.error(`کاربر با telegramId ${userId} یافت نشد`);
        await ctx.reply('❌ کاربر یافت نشد. لطفاً ابتدا ربات را استارت کنید.');
        return;
    }
    const userDbId = user._id;  // ObjectId معتبر مونگو
    console.log(user.referredBy, 'user.referredBy ')
    if (user.referredBy) {
        const commissionAmount = 5000; // تومان
        // ثبت کمیسیون
        await ReferralCommission.create({
            referrer: user.referredBy,
            referred: user._id,
            amount: commissionAmount,
            status: 'pending'
        });
        await User.findByIdAndUpdate(user.referredBy, {
            $inc: { pendingCommission: commissionAmount, totalCommission: commissionAmount }
        });
    }


    // ذخیره خرید
    await Purchase.create({
        userId: userDbId,
        plan: 'management',
        amount: amount,
        orderId: combined,
        verified: true,
        paidAt: new Date(),
        paygiri: paygiri
    });
    // 3. ارتقا نقش کاربر به admin
    user.role = 'admin';
    user.botState = 'awaiting_building_name'; // شروع فرآیند پرسش نام
    user.tempBuildingName = undefined;
    await user.save();
    // 4. پیام موفقیت + درخواست نام ساختمان
    await ctx.reply(
        `✅ *پرداخت با موفقیت انجام شد!*\nهزینه: ${amount} تومان\n\n` +
        `به پلن مدیریت خوش آمدید. لطفاً **نام ساختمان** خود را وارد کنید:`,
        { parse_mode: 'Markdown' }
    );



});


// هندلر پیام‌های متنی
bot.on('text', async (ctx) => {
    await dbConnect();
    console.log(ctx, 'text on')
    const telegramId = ctx.chat.id;
    const text = ctx.message.text?.trim() || '';

    const chat = ctx.chat;


    // پیدا کردن کاربر و وضعیت او
    const user = await User.findOne({ telegramId });
    if (!user) return; // اگر کاربر ثبت‌نام نکرده، نادیده گرفته شود

    // ─── اعتبارسنجی: متن خالی ─────────────────────────
    if (!text) {
        await ctx.reply('⚠️ لطفاً یک متن غیرخالی ارسال کنید.');
        return;
    }

    // ─── مرحله ۱: دریافت نام ساختمان ──────────────────
    if (user.botState === 'awaiting_building_name') {
        // اعتبارسنجی: حداقل ۲ کاراکتر
        if (text.length < 2) {
            await ctx.reply('⚠️ نام ساختمان باید حداقل ۲ حرف باشد.\nلطفاً دوباره وارد کنید:');
            return;
        }

        // ذخیره موقت نام ساختمان
        user.tempBuildingName = text;
        user.botState = 'awaiting_building_address';
        await user.save();

        await ctx.reply(
            `✅ نام ساختمان "${text}" ثبت شد.\n` +
            'لطفاً **آدرس ساختمان** را وارد کنید:\n' +
            '(برای لغو /cancel را بزنید)'
        ); return;
    }

    // ─── مرحله ۲: دریافت آدرس ساختمان ────────────────
    if (user.botState === 'awaiting_building_address') {
        const buildingName = user.tempBuildingName;

        if (!buildingName) {
            // حالت غیرمنتظره – بازگشت به مرحله نام
            user.botState = 'awaiting_building_name';
            user.tempBuildingName = undefined;
            await user.save();
            await ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره **نام ساختمان** را وارد کنید:');
            return;
        }
        // اعتبارسنجی آدرس
        if (text.length < 5) {
            await ctx.reply('⚠️ آدرس ساختمان باید حداقل ۵ حرف باشد.\nلطفاً دوباره وارد کنید:');
            return;
        }

        // ⚡ ذخیره موقت وضعیت برای rollback در صورت خطا
        const previousBotState = user.botState;
        const previousTempName = user.tempBuildingName;
        const prevTempId = user.tempBuildingId;

        try {
            console.log(`ایحجاد ساختمان: 
                name:${buildingName}, address: ${text} , mangerId : ${user._id}
                `)
            // ایجاد ساختمان
            const Building = (await import('@/app/models/Building')).default;
            const newBuilding = await Building.create({
                name: buildingName,
                address: text,
                managerId: user._id,

            });
            console.log(`newBuliding : ${newBuilding}`)
            console.log(`ایحجاد BuildingMember: 
                buildingId:${newBuilding._id}, userId: ${user._id} 
                `)
            // اضافه کردن کاربر به عنوان admin-member
            const BuildingMember = (await import('@/app/models/BuildingMember')).default;
            await BuildingMember.create({
                buildingId: newBuilding._id,
                userId: user._id,
                role: 'admin',
                joinedAt: new Date(),
            });
            // ۳) اضافه کردن userId به آرایه members خود ساختمان
            await Building.findByIdAndUpdate(newBuilding._id, {
                $push: { members: user._id },
            });
            // ─── موفقیت ────────────────────────────────────────

            // پاک کردن وضعیت موقت
            user.botState = 'idle';
            user.tempBuildingName = undefined;
            user.tempBuildingId = undefined;

            await user.save();
            // ارسال پیام نهایی با دکمه داشبورد
            const miniAppUrl = 'https://dev.marloo.shop/dashboard';
            await ctx.reply(
                `✅ *ساختمان با موفقیت ثبت شد!*\n\n` +
                `🏢 نام: ${buildingName}\n` +
                `📍 آدرس: ${text}\n\n` +
                `اکنون می‌توانید از پنل مدیریت استفاده کنید.`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🚀 رفتن به داشبورد مدیریت',
                                    web_app: { url: miniAppUrl },
                                },
                            ],
                        ],
                    },
                }
            );
            console.log(`✅ ساختمان "${buildingName}" برای کاربر ${telegramId} ایجاد شد.`);
        } catch (error) {
            // ─── خطا: بازگشت به حالت قبل ────────────────
            console.error(`❌ خطا در ایجاد ساختمان برای کاربر ${telegramId}:`, error);

            user.botState = previousBotState;
            user.tempBuildingName = previousTempName;
            user.tempBuildingId = prevTempId;

            await user.save();

            await ctx.reply(
                '❌ متأسفانه در ثبت ساختمان خطایی رخ داد.\n' +
                'لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.\n\n' +
                'دستور /start را بزنید تا از اول شروع کنید.'
            );
        }
        return;

    }
    if (user.botState === 'awaiting_card') {
        console.log('awaiting_card')
        // پردازش شماره کارت
        const text = ctx.message.text.trim();
        const lines = text.split('\n').map(l => l.trim());
        const cardNumber = lines[0].replace(/\s/g, '');
        const fullName = lines.slice(1).join(' ') || undefined;

        // اعتبارسنجی ساده
        if (cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
            return ctx.reply("شماره کارت معتبر نیست (16 رقم). لطفاً دوباره ارسال کنید.");
        }

        // ذخیره در کاربر
        const updateUser = await User.findByIdAndUpdate(user._id, {
            cardNumber,
            fullName,
            botState: 'idle',
        },
            { new: true } // <-- سند جدید رو برگردون
        );
        if (!updateUser) {
            await ctx.reply(
                ` از دستور زیر استفاده کنید` +
                '(برای اجرا دستور /start را بزنید)',
                { parse_mode: 'Markdown' }
            );
        }
        console.log(updateUser, 'updateUser')
        // ایجاد درخواست برداشت
        await createWithdrawalRequest(updateUser, ctx.chat.id, ctx);
    }


    await ctx.reply(
        `لطفا از دستور زیر استفاده کنید` +
        '(برای اجرا دستور /start را بزنید)',
        { parse_mode: 'Markdown' }
    );

});

// دستور /cancel – بازگشت به idle
bot.command('cancel', async (ctx) => {
    await dbConnect();

    const telegramId = ctx.chat.id;
    const user = await User.findOne({ telegramId });

    if (!user) {
        await ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. از /start استفاده کنید.');
        return;
    }

    if (user.botState === 'idle') {
        await ctx.reply('❌ شما در حال انجام هیچ فرایندی نیستید.');
        return;
    }

    // پاک کردن وضعیت موقت و بازگشت به idle
    user.botState = 'idle';
    user.tempBuildingName = undefined;
    user.tempBuildingId = undefined;
    await user.save();

    await ctx.reply(
        '✅ فرایند لغو شد.\n' +
        'به منوی اصلی بازگشتید.',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💰 خرید پلن مدیریت', callback_data: "buy_plane" }]
                ],
                resize_keyboard: true,
            },
        }
    );
});


// دریافت تصویر رسید
bot.on('photo', async (ctx) => {
    // try {
    //     await dbConnect()
    //     // telegramId karbar
    //     const userId = ctx.from?.id?.toString(); // تبدیل به string
    //     const photos = ctx.message?.photo;

    //     if (!photos || photos.length === 0) return;

    //     // دریافت بهترین کیفیت تصویر
    //     const photo = photos[photos.length - 1];
    //     const fileId = photo.file_id;

    //     // دریافت اطلاعات کاربر از دیتابیس
    //     const UserInfo = await User.findOne({ telegramId: userId }).select('role _id firstName')
    //     if (UserInfo.role === 'none') return
    //     const userBuilding = await BuildingMember.findOne({ userId: UserInfo._id }).select('buildingId');

    //     if (!userBuilding) {
    //         return ctx.reply('❌ شما عضو هیچ ساختمانی نیستید');
    //     }

    //     // دریافت متن همراه (اگر وجود داشته باشد)
    //     const caption = ctx.message?.caption || '';

    //     // استخراج مبلغ از کپشن (اختیاری)
    //     const amount = extractAmountFromCaption(caption);

    // ذخیره رسید در دیتابیس
    // const payment = await saveReceiptToBale({
    //     userId,
    //     buildingId: userBuilding.buildingId,
    //     fileId,
    //     caption,
    //     chatId: ctx.chat?.id,
    //     amount,

    // });

    //     await ctx.reply(
    //         '✅ *رسید شما با موفقیت ثبت شد*\n\n'
    //         // + `📋 کد پیگیری: ${payment._id}\n`
    //         + '⏳ پس از تایید ادمین به شما اطلاع داده خواهد شد.',
    //         { parse_mode: 'Markdown' }
    //     );

    //     // ارسال نوتیفیکیشن به ادمین‌ها
    //     await sendTelegramNotification(userBuilding.buildingId, {
    //         type: 'new_payment_receipt',
    //         userId,
    //         paymentId: payment._id,
    //         fileId,
    //     }, UserInfo.firstName
    //     );


    // } catch (error) {
    //     console.error('Error in photo handler:', error);
    //     await ctx.reply('❌ خطا در ثبت رسید. لطفاً دوباره تلاش کنید.');
    // }
});

// هندلر خطا
bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err);
    ctx.reply('متأسفانه خطایی رخ داد.');
});




export default bot;
export { activeChats };