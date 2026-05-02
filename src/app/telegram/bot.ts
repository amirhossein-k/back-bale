// app\telegram\bot.ts
import { Telegraf } from "telegraf";
import { startHandler } from "./handlers/start";

const activeChats = new Map<number, number>();
const editState = new Map<number, "about" | "searching" | "interests" | "name" | "age">();


// const bot = new Telegraf(process.env.BOT_TOKEN!);
const BOT_TOKEN = 'bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

const bot = new Telegraf(BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://tapi.bale.ai'  // 🔥 تغییر آدرس به بله
    }
});
// هندلرهای معمولی (کاملاً مشابه تلگرام)
bot.start((ctx) => {
    ctx.reply('👋 سلام! ربات بله با Telegraf کار می‌کند.');
});

// ---- استارت و ثبت پروفایل ----
// bot.start(startHandler()); // اینجا هندلر استارت جدید
bot.on('text', (ctx) => {
    console.log(`📍 پیام از ${ctx.from.id}: ${ctx.message.text}`);
    ctx.reply(`شما گفتید: ${ctx.message.text}`);
});


export async function POST(req: Request) {
    try {
        console.log('object')
        const body = await req.json();
        await bot.handleUpdate(body);
        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("❌ Error in POST handler:", err);
        return new Response("Error", { status: 500 });
    }
}


export default bot;
export { activeChats };