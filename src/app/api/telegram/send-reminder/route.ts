// src\app\api\telegram\send-reminder\route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import { getPersianChargeName, getPersianMonthName } from "@/hooks/database";

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.NEXTAUTH_URL || "https://marloo.shop";

export async function POST(req: NextRequest) {
       try {
              const { chargeId, userId, telegramChatId } = await req.json();

              if (!chargeId || !userId || !telegramChatId) {
                     return NextResponse.json(
                            { success: false, error: "اطلاعات ناقص است" },
                            { status: 400 }
                     );
              }

              await dbConnect();
              const charge = await MonthlyCharge.findById(chargeId).lean();
              if (!charge) {
                     return NextResponse.json(
                            { success: false, error: "شارژ یافت نشد" },
                            { status: 404 }
                     );
              }

              const chargeName = getPersianChargeName(charge.title) || charge.title;
              const monthName = getPersianMonthName(charge.month) || charge.month;
              const amountToman = charge.totalAmount.toLocaleString("fa-IR");

              const message = `⚠️ یادآوری پرداخت\n\nنوع: ${chargeName}\nماه: ${monthName} ${charge.year}\nمبلغ: ${amountToman} تومان\nلطفاً هرچه سریع‌تر اقدام به پرداخت نمایید.`;

              // لینک پرداخت (API GET که کاربر را به درگاه زرین‌پال هدایت می‌کند)
              const paymentLink = `${BASE_URL}/api/payment/initiate-charge?chargeId=${chargeId}&userId=${userId}&telegramId=${telegramChatId}`;

              // ارسال پیام با دکمه شیشه‌ای
              const sendRes = await fetch(`https://tapi.bale.ai/bot${BOT_TOKEN}/sendMessage`, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                            chat_id: telegramChatId,
                            text: message,
                            parse_mode: "Markdown",
                            reply_markup: {
                                   inline_keyboard: [
                                          [
                                                 {
                                                        text: "💳 پرداخت آنلاین",
                                                        url: paymentLink,
                                                 },
                                          ],
                                   ],
                            },
                     }),
              });

              if (!sendRes.ok) {
                     const errorText = await sendRes.text();
                     console.error("Bale API error:", errorText);
                     throw new Error("Failed to send message");
              }

              return NextResponse.json({ success: true, message: "یادآوری ارسال شد" });
       } catch (error: any) {
              console.error("Reminder error:", error);
              return NextResponse.json(
                     { success: false, error: error.message || "خطا در ارسال پیام" },
                     { status: 500 }
              );
       }
}