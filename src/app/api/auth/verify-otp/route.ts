// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../mongodb";
import { Otp } from "@/app/models/Otp";
import User from "@/app/models/User";
import { compare } from "bcryptjs";
import Purchase from "@/app/models/Purchase";
import { generateCodeYekta } from "@/lib/auth";

export async function POST(req: NextRequest) {
       try {
              await dbConnect();

              const body = await req.json();
              const { phoneNumber, code } = body;

              // 1. اعتبارسنجی ورودی‌ها
              if (!phoneNumber || !code) {
                     return NextResponse.json(
                            { error: "شماره موبایل و کد تأیید الزامی است" },
                            { status: 400 }
                     );
              }

              if (!/^09\d{9}$/.test(phoneNumber)) {
                     return NextResponse.json(
                            { error: "شماره موبایل معتبر نیست" },
                            { status: 400 }
                     );
              }

              if (!/^\d{6}$/.test(code)) {
                     return NextResponse.json(
                            { error: "کد تأیید باید ۶ رقمی باشد" },
                            { status: 400 }
                     );
              }

              // 2. پیدا کردن OTP معتبر
              const otp = await Otp.findOne({
                     phoneNumber,
                     expiresAt: { $gt: new Date() },
              });

              if (!otp) {
                     return NextResponse.json(
                            { error: "کد تأیید منقضی شده است. لطفاً درخواست کد جدید دهید" },
                            { status: 410 } // Gone
                     );
              }
              // 3. بررسی تعداد تلاش‌ها
              if (otp.attempts >= 5) {
                     await Otp.deleteOne({ _id: otp._id });
                     return NextResponse.json(
                            { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کد جدید درخواست کنید" },
                            { status: 429 }
                     );
              }
              // ✅ مقایسه کد دریافتی با کد هش شده در دیتابیس
              const isValid = await compare(code, otp.code);

              if (!isValid) {
                     // افزایش تعداد تلاش‌ها
                     otp.attempts += 1;
                     await otp.save();

                     const remainingAttempts = 5 - otp.attempts;
                     return NextResponse.json(
                            {
                                   error: `کد تأیید اشتباه است. ${remainingAttempts} تلاش باقی مانده`,
                                   remainingAttempts,
                            },
                            { status: 401 }
                     );
              }
              let purchase = await Purchase.findOne({ phoneNumber: phoneNumber });
              let finalCodeYekta: string;

              if (!purchase) {
                     finalCodeYekta = generateCodeYekta();
                     try {
                            purchase = await Purchase.create({
                                   phoneNumber: phoneNumber,
                                   codeYekta: finalCodeYekta,
                            });
                            console.log("✅ Purchase created:", purchase);
                     } catch (err) {
                            console.error("❌ Error creating Purchase:", err);
                            throw new Error("خطا در ثبت اطلاعات کاربر");
                     }
              } else {
                     finalCodeYekta = purchase.codeYekta;
                     console.log("✅ Purchase already exists, using existing codeYekta:", finalCodeYekta);
              }


              return NextResponse.json({
                     message: "احراز هویت موفق",
                     user: {
                            id: otp._id
                     },
                     // token: generateJwt(user._id), // اگر JWT لازم است
              });
       } catch (err: any) {
              console.error("❌ verify-otp error:", err);
              return NextResponse.json(
                     { error: "خطای سرور. لطفاً دوباره تلاش کنید" },
                     { status: 500 }
              );
       }
}
