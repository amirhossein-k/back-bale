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
import Building from "@/app/models/Building";
import { ChargePaid } from "./handlers/ChargePaid";
import { getPersianMonthName } from "@/hooks/database";

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

bot.action(/ChargePaid_ok:(.+)/, ChargePaid())

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
    const message = (ctx.update as any)?.message
    const userInfoBuyId = message?.from?.id
    console.log(userInfoBuyId, 'userInfoBuyId')
    if ((ctx.update as any)?.message?.successful_payment) {

        if (!message?.successful_payment) {
            console.log('dddddddddddddddddddddddddd')
        };

        ///update =>>>> message =>> date : تاریخ 
        // const datePay = message?.date
        //update =>>>> message =>>>>>  from :من که پرداخت کردم or  chat
        //update =>>> successful_payment =>>>> total_amount | invoice_payload: example= order_360594256_1778018078695 | telegram_payment_charge_id : کد پیگیری
        const payment = (ctx.update as any)?.message?.successful_payment

        const paymentInfo = {
            amount: payment?.total_amount,
            invoice_payload: payment?.invoice_payload,
            paygiri: payment?.telegram_payment_charge_id
        }
        console.log(paymentInfo.invoice_payload, 'bot paymentInfo invoice_payload')
        if (paymentInfo.invoice_payload) {
            const [order, chatId, DatePay, typeEng, typePer, year, month, chargeId] = paymentInfo.invoice_payload.split('_');
            // const invoice_payload = order_chatId_Date_typeEng_typePer_year_month_chargeId
            console.log(chargeId, 'bot chargeId')
            if (order === 'ordercharge') {

                // id member string
                const telegramId = String(userInfoBuyId);

                // ========== مرحله 1: پیدا کردن شارژ ==========
                const charge = await MonthlyCharge.findById(chargeId).lean();
                if (!charge) throw new Error('شارژ یافت نشد');
                if (!charge.buildingId) throw new Error('شارژ فاقد buildingId است');

                // ========== مرحله 2: پیدا کردن مدیر ساختمان ==========
                const building = await Building.findById(charge.buildingId)
                    .populate('managerId', '_id telegramId')  // ✅ دریافت telegramId از User
                    .lean()
                if (!building || !building.managerId) throw new Error('ساختمان یا مدیر یافت نشد');
                // building.managerId = objectId ===> use Id
                const managerIdd = building.managerId._id
                const chatAdminId = building.managerId.telegramId


                // ========== مرحله 3: یافتن یا ایجاد کیف پول مدیر (اتمیک) ==========
                const wallet = await Wallet.findOneAndUpdate(
                    { userId: managerIdd },
                    {
                        $setOnInsert: {
                            buildingId: charge.buildingId,
                            balance: 0,
                            totalDeposited: 0,
                            totalWithdrawn: 0,
                            status: 'pending',
                            createdAt: new Date(),
                        },
                        $set: {
                            updatedAt: new Date()
                        }
                    },
                    {
                        upsert: true,
                        returnDocument: 'after',  // ✅ رفع deprecation warning
                        setDefaultsOnInsert: true
                    }
                )
                // ========== مرحله 4: بروزرسانی موجودی کیف پول مدیر ==========
                await Wallet.updateOne(
                    { userId: managerIdd },
                    {
                        $inc: {
                            balance: paymentInfo.amount,
                            totalDeposited: paymentInfo.amount
                        },
                        $set: {
                            updatedAt: new Date(),
                            // status: 'completed'
                        }
                    }
                );
                // ========== مرحله 4: بروزرسانی موجودی کیف پول مدیر ==========
                // بعد اینکه مدیر ربات پول زد 
                // await Wallet.updateOne(
                //     { userId: managerIdd },
                //     {
                //         $inc: {
                //             balance: paymentInfo.amount,

                //         },
                //         $set: {
                //             updatedAt: new Date(),
                //             status: 'completed'
                //         }
                //     }
                // );

                // ========== مرحله 5: بروزرسانی شارژ ماهیانه ==========

                const remainingMembers = charge.targetMember.filter((m: any) => m !== telegramId);

                const newStatus = remainingMembers.length === 0 ? 'completed' : 'partial';

                await MonthlyCharge.findByIdAndUpdate(
                    chargeId,
                    {
                        $pull: { targetMember: telegramId }, $set: {
                            status: newStatus,
                            updatedAt: new Date()
                        }
                    }
                );

                // ========== مرحله 6: ثبت تراکنش ==========

                await Transaction.create({
                    userId: telegramId,
                    buildingId: charge.buildingId,
                    amount: paymentInfo.amount,
                    type: typeEng,
                    description: `پرداخت ${typePer} ${month}/${year}`,
                    status: 'completed',
                    paymentMethod: 'bale_wallet',
                    referenceId: paymentInfo.paygiri,//کد پیگری
                    completedAt: DatePay
                })

                // const keyboardmodir = {
                //     inline_keyboard: [
                //         [
                //             {
                //                 text: 'پرداخت',
                //                 callback_data: `Charge_ok:${wallet._id}`,
                //             }
                //         ],
                //     ],
                //     resize_keyboard: true,
                // };
                // managerIdd =id temgram admin notife to modir
                //پیام به مدیر که شماره کارت ثبت کن اگر نکردی
                const monthper = getPersianMonthName(month)
                await ctx.telegram.sendMessage(1616176632,
                    ` *سلام مدیر بازو*
            
                    ممبلغ: ${paymentInfo.amount}
                    کد پیگیری: ${paymentInfo.paygiri}
                   
                    ` +
                    `به مدیر ان ساختمان پرداخت کن`
                    , {
                        parse_mode: 'Markdown',
                        // reply_markup: keyboardmodir,
                    });

                // پیام به مدیر ساختمان
                await ctx.telegram.sendMessage(chatAdminId,
                    `
                    کاربر: ${message.from.first_name} 
                    `+ `✅ *پرداخت ${typePer} ${monthper}/${year} پرداخت شد*\n\n` +
                    `💰 مبلغ: ${paymentInfo.amount.toLocaleString('fa-IR')} تومان\n` +
                    `🔗 کد پیگیری: ${paymentInfo.paygiri}\n` +
                    `*ساعت 24 هر شب  موجودی کیف پول شما به حسابتان واریز میشود*`
                    , {
                        parse_mode: 'Markdown',

                    });
            } else if (order === 'order') {
                // خرید پلن مدیریت
                // // ایدی کاربر در بله ===> // userInfoBuyId

                // "invoice_payload": "order_1616176632_1777741299714",
                // paymentInfo {
                //         amount: payment?.total_amount,
                //         invoice_payload: payment?.invoice_payload,
                //         paygiri: payment?.telegram_payment_charge_id
                // }

                const invoiceId = payment.invoice_payload
                // کد پیگری پرداخت
                const combined = `${invoiceId}_${paymentInfo.paygiri}`;

                if (!invoiceId || !paymentInfo.paygiri) {
                    console.error('اطلاعات پرداخت ناقص است');
                    return;
                }

                // const message = `✅ پرداخت با موفقیت انجام شد با هزینه${paymentInfo.amount}. به پلن ویژه خوش‌آمدید!`
                // console.log(`successful_payment || ${ctx.message.successful_payment}`)
                console.log(`💰 پرداخت موفق برای سفارش: ${userInfoBuyId}`);
                // ✅ 3. پیدا کردن کاربر با telegramId (نه findById)
                const user = await User.findOne({ telegramId: userInfoBuyId });
                if (!user) {
                    console.error(`کاربر با telegramId ${userInfoBuyId} یافت نشد`);
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
                    amount: paymentInfo.amount,
                    orderId: combined,
                    verified: true,
                    paidAt: new Date(),
                    paygiri: paymentInfo.paygiri
                });
                // 3. ارتقا نقش کاربر به admin
                user.role = 'admin';
                user.botState = 'awaiting_building_name'; // شروع فرآیند پرسش نام
                user.tempBuildingName = undefined;
                await user.save();
                // 4. پیام موفقیت + درخواست نام ساختمان
                await ctx.reply(
                    `✅ *پرداخت با موفقیت انجام شد!*\nهزینه: ${paymentInfo.amount} تومان\n\n` + `کد پیگیر خرید: ${paymentInfo.paygiri}` +
                    `به پلن مدیریت خوش آمدید. \nلطفاً **نام ساختمان** خود را وارد کنید:`,
                    { parse_mode: 'Markdown' }
                );


            } else {
                return
            }



        }
    }
    //////////////////////////////////////////  text ///////////////////////////// 
    /// action.on('text):
    // await dbConnect();
    console.log(ctx, 'text on')
    const text = message.text?.trim() || '';

    const chat = ctx.chat;


    // پیدا کردن کاربر و وضعیت او
    const user = await User.findOne({ telegramId: userInfoBuyId });
    if (!user) return; // اگر کاربر ثبت‌نام نکرده، نادیده گرفته شود
    console.log(user, 'userrrr')
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
        // const messageId = (ctx.update.update_id);
        // ctx.deleteMessage(Number(messageId))
        await ctx.reply(

            `✅ نام ساختمان "${text}" ثبت شد.\n` +
            'لطفاً **آدرس ساختمان** را وارد کنید:\n'

            , {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'برگشت', callback_data: 'backUser_NameBuild', }],

                    ],

                },
            }
        ); return;
    }

    // ─── مرحله ۲: دریافت آدرس ساختمان ────────────────
    if (user.botState === 'awaiting_building_address') {
        const buildingName = user.tempBuildingName;
        // await ctx.answerCbQuery(); // در نسخه‌های جدیدتر Telegraf
        console.log('starttttt')
        console.log(ctx, 'awatinggggg')
        // const messageId = (ctx.update.update_id);
        // ctx.deleteMessage(Number(messageId))
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
        user.tempBuildingAddress = text;
        user.botState = 'awaiting_card';
        // /backUser_AddressBuild
        await user.save();
        await ctx.reply(
            `✅ ادرس ساختمان "${text}" ثبت شد.\n` +
            'لطفاً **شماره حساب ** جهت دریافت واریزی های اعضا ساختمان را وارد کنید:\n' + `
            مثال: خط اول: شماره کارت \n
            خط دوم: اسم صاحب حساب\n
            603770152153289\n
            کریمی\n
            `,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'برگشت', callback_data: 'backUser_AddressBuild', }],

                    ],

                },
            }
        ); return;



    }
    if (user.botState === 'awaiting_card') {
        console.log('awaiting_card')
        // await ctx.answerCbQuery(); // در نسخه‌های جدیدتر Telegraf
        const messageId = ctx.callbackQuery?.message?.message_id;
        ctx.deleteMessage(messageId)
        // پردازش شماره کارت
        // const text = ctx.message.text.trim();
        const lines = text.split('\n').map((l: any) => l.trim());
        const cardNumber = lines[0].replace(/\s/g, '');
        const fullName = lines.slice(1).join(' ') || undefined;

        // اعتبارسنجی ساده
        if (cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
            return ctx.reply("شماره کارت معتبر نیست (16 رقم)و کیبورد انگلیسی باشد. لطفاً دوباره ارسال کنید.");
        }


        //اگر در مرحله خرید توسط مدیر بود و خرید انجام شد بعد اینکه ادرس ساختمان زد باید شماره کارت وارد کند 
        if (user.role === 'admin' && (!user.cardNumber || user.cardNumber.length < 0)) {
            const buildingName = user.tempBuildingName;
            const buildingAddress = user.tempBuildingAddress;

            // ⚡ ذخیره موقت وضعیت برای rollback در صورت خطا
            const previousBotState = user.botState;
            const previousTempName = user.tempBuildingName;
            const prevTempId = user.tempBuildingId;
            const prevTempAdreess = user.tempBuildingAddress;

            try {
                console.log(`ایجاد ساختمان: 
                name:${buildingName}, address: ${text} , mangerId : ${user._id}
                `)
                // ایجاد ساختمان
                const Building = (await import('@/app/models/Building')).default;
                const newBuilding = await Building.create({
                    name: buildingName,
                    address: buildingAddress,
                    managerId: user._id,

                });
                console.log(`newBuliding : ${newBuilding}`)
                console.log(`ایجاد BuildingMember: 
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
                user.nameBuilding = buildingName
                user.adressBuilding = buildingAddress
                user.cardNumber = cardNumber
                user.fullName = fullName
                // پاک کردن وضعیت موقت
                user.botState = 'idle';
                user.tempBuildingName = undefined;
                user.tempBuildingId = undefined;
                user.tempBuildingAddress = undefined;

                await user.save();
                // ارسال پیام نهایی با دکمه داشبورد
                const miniAppUrl = 'https://marloo.shop/';
                await ctx.reply(
                    `✅ *ساختمان با موفقیت ثبت شد!*\n\n` +
                    `🏢 نام: ${buildingName}\n` +
                    `📍 آدرس: ${buildingAddress}\n\n` +
                    `اطلاعات حساب:` + ` شماره حساب: ${cardNumber} به نام: ${fullName}` +
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
                console.log(`✅ ساختمان "${buildingName}" برای کاربر ${userInfoBuyId} ایجاد شد.`);
            } catch (error) {
                // ─── خطا: بازگشت به حالت قبل ────────────────
                console.error(`❌ خطا در ایجاد ساختمان برای کاربر ${userInfoBuyId}:`, error);

                user.botState = previousBotState;
                user.tempBuildingName = previousTempName;
                user.tempBuildingId = prevTempId;
                user.tempBuildingAddress = prevTempAdreess;


                await user.save();

                await ctx.reply(
                    '❌ متأسفانه در ثبت ساختمان خطایی رخ داد.\n' +
                    'لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.\n\n' +
                    'دستور /start را بزنید تا از اول شروع کنید.'
                );
            }
        } else {
            //اگر کاربر عادی می خواست کسب در امد کنه:
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
            await createWithdrawalRequest(updateUser, message.chat.id, ctx);

        }



    }


    // await ctx.reply(
    //     `برای مشاهده تمام امکانات` +
    //     `لطفا از دستور زیر استفاده کنید` +
    //     '(برای اجرا دستور /start را بزنید)',
    //     { parse_mode: 'Markdown' }
    // );

    console.log('eeeeeessssssssssssssssee')
    //////////////////////////////////////////////

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
            await Building.findOneAndUpdate({ members: user._id }, { chatIdGroup: groupId })
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




});


// هندلر پیام‌های متنی
// bot.command('backUser_NameBuild', async (ctx) => {
//     console.log(ctx, 'backUser_NameBuild ffffffffffff')

// });
// bot.action('backUser_NameBuild', async (ctx) => {
//     console.log(ctx, 'backUser_NameBuild ffffffffffff action')

// })

// backUser_NameBuild
bot.action(/^backUser_(.+)$/, async (ctx) => {
    // console.log(ctx, 'ctx backkkkkk')
    await ctx.answerCbQuery(); // در نسخه‌های جدیدتر Telegraf
    const messageId = ctx.update.callback_query.message?.message_id;
    ctx.deleteMessage(messageId)
    // await ctx.api.deleteMessage(ctx.chat.id, messageId);

    await dbConnect();
    const requestId = ctx.match[1];
    // const telegramId = ctx?.message?.chat.id;
    const telegramId = ctx.update.callback_query.chat_instance
    // console.log('startttt')
    // console.log(telegramId, 'requestIddddd')
    // console.log(telegramId, 'telegramId')
    const user = await User.findOne({ telegramId });
    if (!user) {
        await ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. از /start استفاده کنید.');
        return;
    }
    if (user.botState === 'idle') {
        await ctx.reply('❌ شما در حال انجام هیچ فرایندی نیستید.');
        return;
    }
    if (requestId === 'NameBuild') {

        // پاک کردن وضعیت موقت و بازگشت به idle
        user.botState = 'awaiting_building_name';
        user.tempBuildingName = undefined;
        await user.save();

        await ctx.reply(
            `📝 لطفاً **نام ساختمان** خود را وارد کنید:\n`

        );

    }
    // backUser_AddressBuild
    else if (requestId === 'AddressBuild') {
        // پاک کردن وضعیت موقت و بازگشت به idle
        user.botState = 'awaiting_building_address';
        user.tempBuildingAddress = undefined;
        await user.save();

        await ctx.reply(
            `📝 لطفاً **آدرس ساختمان** (${user.tempBuildingName || ''}) را وارد کنید:\n`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'برگشت', callback_data: '/backUser_NameBuild', }],
                    ],
                    resize_keyboard: true,
                },
            }
        );

    }




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




// هندلر خطا
bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err);
    ctx.reply('متأسفانه خطایی رخ داد.');
});




export default bot;
export { activeChats };