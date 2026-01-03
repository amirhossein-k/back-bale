// src/app/api/auth/send-otp/route.ts
import { Otp } from "@/app/models/Otp";
import { hash } from "bcryptjs";
import { dbConnect } from "../../mongodb";
import { NextRequest, NextResponse } from "next/server";
// import { Otp } from "@/app/models/Otp";
// import { hash } from "bcryptjs";

// =============== توابع کمکی ===============

function generateCode(): string {
       return Math.floor(100000 + Math.random() * 900000).toString(); // 6 رقمی
}

function validatePhoneNumber(phone: string): boolean {
       return /^09\d{9}$/.test(phone);
}

// =============== سرویس sms.ir ===============

async function sendVerifySms(
       mobile: string,
       code: string,
       templateId: number
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
       const apiKey = process.env.SMS_IR_TOKEN;
       if (!apiKey) {
              console.error("❌ SMS_IR_API_KEY not set in env");
              return { ok: false, error: "سرویس پیامک پیکربندی نشده است" };
       }

       try {
              const response = await fetch("https://api.sms.ir/v1/send/verify", {
                     method: "POST",
                     headers: {
                            "Content-Type": "application/json",
                            'Accept': 'text/plain',
                            "x-api-key": apiKey,
                     },
                     body: JSON.stringify({
                            mobile,
                            templateId,
                            parameters: [
                                   {
                                          name: "OTP", // نام کلید در قالب پیامک
                                          value: code,
                                   },
                            ],
                     }),
              });

              const data = await response.json();

              if (data.status === 1) {
                     return { ok: true, messageId: data.data.messageId };
              }
              return { ok: false, error: data.message || "خطا در ارسال پیامک" };
       } catch (err: any) {
              return { ok: false, error: err.message };
       }
}

// =============== هندلر اصلی ===============

export async function POST(req: NextRequest) {
       try {
              await dbConnect();

              const body = await req.json();
              const { phoneNumber } = body;

              // 1. اعتبارسنجی شماره
              if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
                     return NextResponse.json(
                            { error: "شماره موبایل معتبر وارد کنید (مثال: 09123456789)" },
                            { status: 400 }
                     );
              }

              // 2. بررسی فاصله زمانی از آخرین درخواست (Rate Limiting ساده)
              const lastOtp = await Otp.findOne({
                     phoneNumber,
                     createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) }, // 2 دقیقه قبل
              });

              if (lastOtp) {
                     const remaining = Math.ceil(
                            (2 * 60 * 1000 - (Date.now() - lastOtp.createdAt.getTime())) / 1000
                     );
                     return NextResponse.json(
                            {
                                   error: `لطفاً ${remaining} ثانیه صبر کنید و دوباره تلاش کنید`,
                                   remainingSeconds: remaining,
                            },
                            { status: 429 }
                     );
              }

              // 3. حذف کدهای قبلی منقضی‌نشده
              await Otp.deleteMany({
                     phoneNumber,
                     expiresAt: { $gt: new Date() },
              });

              // 4. تولید کد جدید
              const code = generateCode();
              const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 دقیقه اعتبار

              console.log(code, 'ceodeee')
              let hashedCode: string;
              try {
                     hashedCode = await hash(code, 12);
              } catch {
                     return NextResponse.json(
                            { error: "خطای داخلی سرور" },
                            { status: 500 }
                     );
              }
              // 5. ذخیره در دیتابیس
              await Otp.create({
                     phoneNumber,
                     code: hashedCode,
                     expiresAt,
              });

              // 6. ارسال پیامک
              const templateId = Number(process.env.SMS_IR_TEMPLATE_ID) || 574993; // از env
              const smsResult = await sendVerifySms(phoneNumber, code, templateId);

              if (!smsResult.ok) {
                     // پیامک ارسال نشد – کد ذخیره شده را پاک کن
                     await Otp.deleteMany({ phoneNumber, code: hashedCode });
                     return NextResponse.json(
                            { error: smsResult.error || "خطا در ارسال پیامک" },
                            { status: 502 }
                     );
              }

              // 7. لاگ موفق
              console.log(`✅ OTP sent to ${phoneNumber} (messageId: ${smsResult.messageId})`);

              // در محیط توسعه: کد را در پاسخ برگردان (فقط برای debug)
              const isDev = process.env.NODE_ENV === "development";
              return NextResponse.json({
                     message: "کد تأیید با موفقیت ارسال شد",
                     messageId: smsResult.messageId,
                     ...(isDev && { code }), // فقط در dev
              });
       } catch (err: any) {
              console.error("❌ send-otp error:", err);
              return NextResponse.json(
                     { error: "خطای سرور. لطفاً دوباره تلاش کنید" },
                     { status: 500 }
              );
       }
}
