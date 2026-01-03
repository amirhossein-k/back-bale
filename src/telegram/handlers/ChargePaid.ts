import { dbConnect } from "@/app/api/mongodb";
import { Transaction } from "@/app/models/Transaction";
import User from "@/app/models/User";
import { Wallet } from "@/app/models/Wallet";
import { Context } from "telegraf";


export function ChargePaid() {
    return async (ctx: any) => {

        try {
            const walletID = ctx.match[1];
            //             await dbConnect()

            //             const wallet = await Wallet.findByIdAndUpdate(walletID,{
            //                 $inc:{}
            //             })

            //   await User.findByIdAndUpdate(user._id, {
            //         $inc: { pendingCommission: -amount },
            //     });





        }
        catch (error) {
            console.error(error);
            await ctx.telegram.sendMessage(ctx.chat?.id!, "خطا رخ داد.");

        }
    }

}