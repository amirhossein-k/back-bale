// src/app/api/telegram/user/update-phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import User from "@/app/models/User";

const BOT_TOKEN = process.env.BOT_TOKEN;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://marloo.shop";

export async function POST(request: NextRequest) {
       try {
              await dbConnect();
              const { telegramId, phoneNumber } = await request.json();

              if (!telegramId || !phoneNumber) {
                     return NextResponse.json(
                            { success: false, error: "telegramId و phoneNumber الزامی هستند" },
                            { status: 400 }
                     );
              }

              // اعتبارسنجی شماره
              const phoneRegex = /^09[0-9]{9}$/;
              if (!phoneRegex.test(phoneNumber)) {
                     return NextResponse.json(
                            { success: false, error: "شماره تماس نامعتبر است (باید با 09 شروع و 11 رقم باشد)" },
                            { status: 400 }
                     );
              }

              const updatedUser = await User.findOneAndUpdate(
                     { telegramId },
                     { phoneNumber },
                     { new: true, runValidators: true }
              );

              if (!updatedUser) {
                     return NextResponse.json(
                            { success: false, error: "کاربر یافت نشد" },
                            { status: 404 }
                     );
              }

              // ✅ ارسال پیام تأیید به صورت غیرهمگام (fire-and-forget)
              if (BOT_TOKEN) {
                     const successMessage = `✅ شماره تماس شما با موفقیت ثبت شد.\n📞 شماره ثبت‌شده: ${phoneNumber}`;
                     // بدون await، فقط اجرا می‌شود و خطاها لاگ می‌گردند
                     Promise.resolve().then(async () => {
                            try {
                                   await fetch(`${NEXTAUTH_URL}/api/telegram/send`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                                 text: successMessage,
                                                 userIds: [telegramId],
                                          }),
                                   });
                            } catch (err) {
                                   console.error("Failed to send confirmation message (async):", err);
                            }
                     });
              } else {
                     console.warn("BOT_TOKEN not set, skipping confirmation message");
              }

              // پاسخ موفقیت بلافاصله برگردانده می‌شود (بدون انتظار برای ارسال پیام)
              return NextResponse.json({
                     success: true,
                     user: {
                            _id: updatedUser._id,
                            phoneNumber: updatedUser.phoneNumber,
                            telegramId: updatedUser.telegramId,
                            role: updatedUser.role,
                     },
              });
       } catch (error: any) {
              console.error("Error updating phone:", error);
              return NextResponse.json(
                     { success: false, error: "خطای داخلی سرور" },
                     { status: 500 }
              );
       }
}