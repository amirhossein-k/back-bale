
// src\app\api\telegram\send\route.ts
import { NextRequest, NextResponse } from "next/server";

type InlineKeyboardButton = {
       text: string;
       callback_data?: string;
       url?: string;
       web_app?: { url: string }
}

type InlineKeyboardRow = InlineKeyboardButton[];

// POST: ارسال اخطار به کاربری که پرداخت نکرده
export async function POST(request: NextRequest) {
       try {
              const body = await request.json();
              const { text, userIds, buildingId, buttons } = body;
              // اعتبارسنجی اولیه
              if (!text || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
                     return NextResponse.json(
                            { success: false, error: "متن یا لیست کاربران معتبر نیست" },
                            { status: 400 }
                     );
              }

              // ساختار دکمه‌ها: اگر از سمت کلاینت ارسال شود، همان را استفاده کن.
              // در غیر این صورت، یک دکمه پیش‌فرض (اختیاری) تعریف کن.
              let inlineKeyboard: InlineKeyboardRow[] = [];

              if (buttons && Array.isArray(buttons) && buttons.length > 0) {
                     // فرض می‌کنیم buttons آرایه‌ای از ردیف‌هاست، هر ردیف خود آرایه‌ای از دکمه‌ها
                     inlineKeyboard = buttons;
              } else {
                     // دکمه‌های پیش‌فرض (در صورت نیاز)
                     inlineKeyboard = [
                            [{
                                   text: "سایت", web_app: { url: 'https://marloo.shop' },
                            }],
                     ];
              }
              // ارسال پیام به کاربران از طریق ربات
              const BOT_TOKEN = process.env.BOT_TOKEN;
              if (!BOT_TOKEN) {
                     return NextResponse.json(
                            { success: false, error: "توکن ربات تنظیم نشده است" },
                            { status: 500 }
                     );
              }

              const sendPromises = userIds.map(async (userId) => {
                     const payload = {
                            chat_id: userId,
                            text: text,
                            parse_mode: "Markdown",
                            reply_markup: {
                                   inline_keyboard: inlineKeyboard,
                            },
                     }
                     const response = await fetch(`https://tapi.bale.ai/bot${BOT_TOKEN}/sendMessage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),

                     })

                     if (!response.ok) {
                            console.error(`Failed to send to ${userId}: ${response.statusText}`);
                            // ادامه می‌دهیم تا بقیه کاربران پیام را دریافت کنند
                     }
                     return response;
              })

              await Promise.all(sendPromises)

              return NextResponse.json({ success: true, message: ' با موفقیت ارسال شد' });
       } catch (error) {
              return NextResponse.json(
                     { success: false, error: ' در ارسال اخطار' },
                     { status: 500 }
              );
       }
}


// POST /api/telegram/send
// Content-Type: application/json

// {
//   "text": "⚠️ مهلت پرداخت شما به پایان رسیده است. لطفاً هرچه سریعتر اقدام کنید.",
//   "userIds": ["123456789", "987654321"],
//   "buildingId": "building_001",
//   "buttons": [
//     [
//       { "text": "📤 ارسال رسید پرداخت", "callback_data": "send_receipt" },
//       { "text": "🔗 لینک پرداخت", "url": "https://example.com/pay" }
//     ],
//     [
//       { "text": "❌ انصراف", "callback_data": "cancel" }
//     ]
//   ]
// }