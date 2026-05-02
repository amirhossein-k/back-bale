import { Context } from 'telegraf';

export function startHandler() {
    return async (ctx: Context) => {
        try {
            // لاگ اطلاعات کاربر
            console.log('👤 User started bot:', {
                id: ctx.from?.id,
                username: ctx.from?.username,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name
            });
            const user = {
                id: ctx.from?.id,
                username: ctx.from?.username,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name
            }
            const message = ` ${user.username ?? ''}👋 *سلام*\n\n
    به *بازوی مدیریت ساختمان* تیم برنامه نویسی مارلو خوش آمدید! 🎉\n
    ما در اینجا کمک شما می‌کنیم تا ساختمان خود را به *بهترین شکل ممکن* اداره کنید.\n
    _برای خرید پلن مدیریت ساختمان، لطفاً از طریق دکمه‌های زیر اقدام کنید._`
            // پیام خوش‌آمد
            return ctx.telegram.sendMessage(
                user.id!,
                message,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "خرید پلن مدیریت", callback_data: "buy_plane" }],
                            [{ text: 'اشنایی با امکانات بازو', callback_data: "about_bazo" }],
                            [{ text: 'تماس با پشتیبانی', callback_data: "call" }],

                        ],
                    },
                }
            );


        } catch (error) {
            console.error('❌ Error in start handler:', error);
            await ctx.reply('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        }
    };
}
