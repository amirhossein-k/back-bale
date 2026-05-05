// src\app\telegram\handlers\start.ts
import { dbConnect } from '@/app/api/mongodb'; // مسیر فایل جدید
import { Context, Markup } from 'telegraf';
import User from '@/app/models/User'
import Building from '@/app/models/Building';
import BuildingMember from '@/app/models/BuildingMember';
export function startHandler() {
    return async (ctx: Context) => {
        try {
            await dbConnect()
            const chatId = ctx.chat?.id
            const from = ctx.from
            const payload = (ctx as any).startPayload;
            console.log(payload, 'payload')
            console.log(chatId, 'chatId')
            // if (!from) return
            let user = await User.findOne({ telegramId: chatId });
            console.log(user, 'user')
            // کاربر جدید → ثبت‌نام
            if (!user) {
                user = await User.create({
                    telegramId: chatId,
                    firstName: ctx.from?.first_name || '',
                    lastName: ctx.from?.last_name || '',
                    username: ctx.from?.username || '',
                    role: 'none',
                    botState: 'idle',

                });
            }

            // ۲. پردازش لینک دعوت
            if (payload && payload.startsWith('inv_')) {
                const building = await Building.findOne({ inviteCode: payload });
                console.log('inv0000000000_')
                if (!building) {
                    await ctx.reply('❌ این لینک دعوت منقضی شده یا معتبر نیست.');
                    return;
                }

                // ۳. بررسی تکراری نبودن
                const existingMember = await BuildingMember.findOne({
                    userId: user._id,
                    buildingId: building._id,
                });

                if (existingMember) {
                    await ctx.reply('✅ شما قبلاً عضو این ساختمان هستید.');
                    return;
                }

                // ۴. عضویت
                try {
                    await BuildingMember.create({
                        userId: user._id,
                        buildingId: building._id,
                        role: 'member',
                        joinedAt: new Date(),
                    });

                    await Building.findByIdAndUpdate(building._id, {
                        $addToSet: { members: user._id },
                    });

                    user.role = 'user'
                    user.save()
                    await ctx.reply(
                        `🎉 شما با موفقیت به ساختمان "${building.name}" اضافه شدید!`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: '🏢 مشاهده ساختمان',
                                        web_app: { url: `https://dev.marloo.shop/dashboard` }
                                    }],
                                ],
                            },
                        }
                    );
                } catch (error) {
                    console.error('❌ خطا در عضویت:', error);
                    await ctx.reply('❌ خطا در عضویت به ساختمان. لطفاً بعداً تلاش کنید.');
                }
                return;
            }
            if (payload && payload.startsWith('POR_')) {
                console.log(payload, 'payloadd')
                // کاربر دعوت شده
                const referrer = await User.findOne({ referralCode: `https://ble.ir/Helppaymentbot?start=${payload}` });
                if (!referrer) {
                    await ctx.reply(
                        `خطا`
                        ,
                        { parse_mode: 'Markdown' }
                    );
                    return;
                }
                user.referredBy = referrer?._id
                user.save()

            }



            // ─── کاربر قبلی – بررسی botState ────────────────
            if (user.botState === 'awaiting_building_name') {
                await ctx.reply(
                    '📝 لطفاً **نام ساختمان** خود را وارد کنید:\n' +
                    '(برای لغو دستور /cancel را بزنید)',
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            if (user.botState === 'awaiting_building_address') {
                await ctx.reply(
                    `📝 لطفاً **آدرس ساختمان** (${user.tempBuildingName || ''}) را وارد کنید:\n` +
                    '(برای لغو دستور /cancel را بزنید)',
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // botState === 'idle' → منوی اصلی
            const isAdmin = user.role === 'admin';
            const isUser = user.role === 'user';
            // await ctx.reply(
            //     (isAdmin || isUser)
            //         ? '🏠 به پنل مدیریت خوش آمدید!'
            //         : '👋 به ربات مدیریت ساختمان خوش آمدید!\n' +
            //         'برای خرید پلن مدیریت و  شروع کار از منوی زیر استفاده کنید.',
            //     {

            //         reply_markup: {
            //             inline_keyboard: (isAdmin || isUser)
            //                 ? [
            //                     [{ text: '🚀 باز کردن مینی‌اپ', web_app: { url: 'https://dev.marloo.shop/dashboard' } }],
            //                 ]
            //                 : [
            //                     [{ text: '💰 خرید پلن مدیریت', callback_data: "buy_plane" }],
            //                     [{ text: 'کسب درآمد', callback_data: "kasb" }],
            //                 ],
            //             resize_keyboard: true,
            //         },
            //     }
            // );
            await ctx.reply(
                (isAdmin || isUser)
                    ? '🏠 به پنل مدیریت خوش آمدید!'
                    : '👋 به ربات مدیریت ساختمان خوش آمدید!\n' +
                    'برای خرید پلن مدیریت و  شروع کار از منوی زیر استفاده کنید.',

                {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard(
                        (isAdmin || isUser) ? [
                            [
                                Markup.button.webApp(
                                    '🚀 باز کردن مینی‌اپ',
                                    'https://dev.marloo.shop/dashboard'
                                ),
                            ],
                            [
                                Markup.button.callback('💰 مشاهده وضعیت شارژ', 'view_charges'),
                                Markup.button.callback('📤 ارسال رسید', 'send_receipt'),
                            ],
                            [
                                Markup.button.callback('👥 لیست اعضا', 'view_members'),
                                Markup.button.callback('⚙️ تنظیمات', 'settings'),
                            ],
                            [

                                Markup.button.callback('کسب درآمد', 'kasb'),
                            ],
                        ] : [
                            [
                                Markup.button.callback('💰 خرید پلن مدیریت', "buy_plane"),
                                Markup.button.callback('کسب درآمد', 'kasb'),
                            ],
                        ]

                    ),
                }
            );




        } catch (error) {
            console.error('❌ Error in start handler:', error);
            await ctx.reply('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        }
    };
}
