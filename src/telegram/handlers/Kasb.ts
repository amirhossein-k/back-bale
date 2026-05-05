// src\telegram\handlers\Kasb.ts
import { dbConnect } from "@/app/api/mongodb";
import User from "@/app/models/User";
import { Context } from "telegraf";

export function KasbHandler() {
    return async (ctx: Context) => {
        try {
            await dbConnect()

            const chatId = ctx.chat?.id
            const userId = ctx.from?.id;

            if (!chatId) return
            const user = await User.findOne({ telegramId: userId }).select('referralCode firstName');

            const keyboard = {
                inline_keyboard: [

                    // [{ text: 'کد دعوت من', callback_data: "LinkInvited" }],
                    [{ text: 'موجودی / برداشت', callback_data: "Commission" }],
                ],
                resize_keyboard: true,
            };


            return ctx.telegram.sendMessage(chatId!, `${user.firstName}\n` + `سلام میتونی با دعوت هر نفر به بازو و خرید انها از بازو کسب درآمد داشته باشید\n` +
                `لینک دعوت من:\n ${user.referralCode}`, {
                reply_markup: keyboard,
            });

        } catch (error) { }
    }
}