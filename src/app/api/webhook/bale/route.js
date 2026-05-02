// src/app/api/webhook/bale/route.js - نسخه کامل
import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.BOT_TOKEN;

// تابع ارسال پیام به کاربر
async function sendMessage(chatId, text) {
  try {
    const response = await fetch(
      `https://tapi.bale.ai/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export async function POST(request) {
  try {
    const update = await request.json();

    // لاگ کامل
    console.log("📦 Update received:", JSON.stringify(update, null, 2));

    // پردازش پیام
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;
      const text = message.text || "";

      console.log(`👤 User ${chatId}: ${text}`);

      // دستورات
      if (text.startsWith("/start")) {
        await sendMessage(chatId, "👋 سلام! به ربات خوش آمدید.");
      } else if (text.startsWith("/help")) {
        await sendMessage(
          chatId,
          "📚 راهنما:\n/start - شروع\n/help - راهنما\n/invoice - ایجاد فاکتور",
        );
      } else {
        await sendMessage(chatId, `شما گفتید: ${text}`);
      }
    }

    // پردازش callback query (کلیک روی دکمه)
    if (update.callback_query) {
      const { callback_query } = update;
      const { data, message, from } = callback_query;

      console.log(`🔘 Callback: ${data} from ${from.id}`);

      // پاسخ به callback (ضروری برای حذف ساعت شنی)
      await fetch(`https://tapi.bale.ai/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: "انجام شد!",
        }),
      });
    }

    // پردازش پرداخت فاکتور
    if (update.invoice_paid) {
      const { invoice_paid } = update;
      console.log(`💰 Invoice paid: ${invoice_paid.invoice_id}`);

      // ارسال تشکر
      await sendMessage(
        invoice_paid.user_id,
        "✅ پرداخت شما با موفقیت انجام شد!",
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
