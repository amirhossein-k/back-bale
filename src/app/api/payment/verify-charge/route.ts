// src\app\api\payment\verify-charge

import Purchase from "@/app/models/Purchase";
import TempPayment from "@/app/models/TempPayment";
import { NextRequest, NextResponse } from "next/server";
import Zarinpal from "zarinpal-node-sdk";
import { dbConnect } from "../../mongodb";
import User from "@/app/models/User";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import Building from "@/app/models/Building";
import { Wallet } from "@/app/models/Wallet";
import { Transaction } from "@/app/models/Transaction";
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXTAUTH_URL || "https://marloo.shop";  // ✅ fallback
function generateUUIDFromIds(chargeId: string, telegramId: string): string {
       // یک namespace ثابت (مثلاً DNS)
       const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
       const input = `${chargeId}:${telegramId}`;
       // هش SHA-256
       const hash = createHash('sha256').update(input).digest();
       // 16 بایت اول (128 بیت)
       const bytes = hash.subarray(0, 16);
       // تنظیم نسخه (version 5)
       bytes[6] = (bytes[6] & 0x0f) | 0x50;
       // تنظیم variant (RFC 4122)
       bytes[8] = (bytes[8] & 0x3f) | 0x80;
       const hex = bytes.toString('hex');
       return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
export async function GET(req: NextRequest) {
       await dbConnect()
       const authority = req.nextUrl.searchParams.get("Authority");
       const status = req.nextUrl.searchParams.get("Status");
       const purchaseId = req.nextUrl.searchParams.get("purchaseId");
       const telegramId = req.nextUrl.searchParams.get("telegramId");
       const chargeId = req.nextUrl.searchParams.get("chargeId"); // دریافت chargeId از callback
       const description = req.nextUrl.searchParams.get("description"); // دریافت chargeId از callback
       const merchantIdd = req.nextUrl.searchParams.get("merchantIdd"); // دریافت chargeId از callback

       // 1. اعتبارسنجی اولیه پارامترها
       if (status !== "OK" || !authority || typeof authority !== "string") {
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
       }
       if (!chargeId || !telegramId) {
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
       }

       // 2. یافتن اطلاعات موقت پرداخت
       const tempPayment = await TempPayment.findOne({ authority });
       if (!tempPayment) {
              console.log("TempPayment not found for authority:", authority);

              // احتمال حمله با Authority نامعتبر
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
       }

       // 3. جلوگیری از پرداخت دوباره (replay attack) با بررسی وضعیت Purchase
       const existingPurchase = await Purchase.findById(tempPayment.purchaseId);
       if (!existingPurchase) {
              console.log("Purchase not found for tempPayment:", tempPayment._id);

              await TempPayment.deleteOne({ _id: tempPayment._id });
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
       }

       if (existingPurchase.status === "paid") {
              console.log("Purchase already paid:", existingPurchase._id);

              // قبلاً پرداخت شده است – حذف رکورد موقت و هدایت به موفقیت
              await TempPayment.deleteOne({ _id: tempPayment._id });
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/success`, req.url));
       }

       // 4. راه‌اندازی SDK زرین‌پال
       // const zarinpal = new Zarinpal({
       //        merchantId: process.env.ZARINPAL_MERCHANT_ID!,
       //        sandbox: false // استفاده از متغیر محیطی برای حالت sandbox
       // });

       /////////////////////////
       // const merchantId = "11111111-1111-1111-1111-11111111111122";
       const merchantId = generateUUIDFromIds(chargeId, telegramId);
       console.log(merchantId, 'merchantId')
       const zarinpal = new Zarinpal({
              merchantId: merchantId,
              sandbox: true // استفاده از متغیر محیطی برای حالت sandbox
       });
       ///////////////////////
       try {
              // 5. تأیید پرداخت با زرین‌پال
              const verification = await zarinpal.verifications.verify({
                     amount: tempPayment.amount,
                     authority,
              });
              console.log("Verification response:", {
                     code: verification.data?.code,
                     ref_id: verification.data?.ref_id,
                     message: verification.errors?.message,
              });

              if (verification.data.code === 100) {
                     // 6. به‌روزرسانی اتمیک Purchase فقط در صورت pending بودن
                     const updateResult = await Purchase.updateOne(
                            { _id: tempPayment.purchaseId, status: "pending" },
                            {
                                   $set: {
                                          status: "paid",
                                          transactionId: verification.data.ref_id,
                                          paymentGateway: "zarinpal",
                                          paidAt: new Date(),
                                          amount: tempPayment.amount,
                                          // planId: tempPayment.planId,
                                          verified: true,
                                   },
                            }
                     );

                     // اگر هیچ سندی به‌روز نشد، یعنی وضعیت قبلاً تغییر کرده بود
                     if (updateResult.matchedCount === 0) {
                            console.log("Race condition - purchase already processed");
                            const currentPurchase = await Purchase.findById(tempPayment.purchaseId);
                            if (currentPurchase?.status === "paid") {
                                   await TempPayment.deleteOne({ _id: tempPayment._id });

                                   return NextResponse.redirect(new URL(`${BASE_URL}/payment/success`, req.url));
                            }
                            return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
                     }

                     const charge = await MonthlyCharge.findById(chargeId).lean();
                     if (!charge) throw new Error('شارژ یافت نشد');
                     if (!charge.buildingId) throw new Error('شارژ فاقد buildingId است');

                     // ========== مرحله 2: پیدا کردن مدیر ساختمان ==========
                     const building = await Building.findById(charge.buildingId)
                            .populate('managerId', '_id telegramId')  // ✅ دریافت telegramId از User
                            .lean()
                     if (!building || !building.managerId) throw new Error('ساختمان یا مدیر یافت نشد');
                     // building.managerId = objectId ===> use Id
                     const managerIdd = building.managerId._id
                     const chatAdminId = building.managerId.telegramId
                     const amountInTomans = tempPayment.amount / 10;

                     // ========== مرحله 3: یافتن یا ایجاد کیف پول مدیر (اتمیک) ==========
                     const wallet = await Wallet.findOneAndUpdate(
                            { userId: managerIdd },
                            {
                                   $setOnInsert: {
                                          buildingId: charge.buildingId,
                                          balance: 0,
                                          totalDeposited: 0,
                                          totalWithdrawn: 0,
                                          status: 'pending',
                                          createdAt: new Date(),
                                   },
                                   $set: {
                                          updatedAt: new Date()
                                   }
                            },
                            {
                                   upsert: true,
                                   returnDocument: 'after',  // ✅ رفع deprecation warning
                                   setDefaultsOnInsert: true
                            }
                     )
                     // ========== مرحله 4: بروزرسانی موجودی کیف پول مدیر ==========
                     await Wallet.updateOne(
                            { userId: managerIdd },
                            {
                                   $inc: {
                                          balance: amountInTomans,
                                          totalDeposited: amountInTomans
                                   },
                                   $set: {
                                          updatedAt: new Date(),
                                          // status: 'completed'
                                   }
                            }
                     );
                     // ========== مرحله 5: بروزرسانی شارژ ماهیانه ==========

                     // ========== مرحله 5: بروزرسانی شارژ ماهیانه ==========
                     // ابتدا کاربر را بر اساس userId (که در پارامتر telegramId آمده) پیدا می‌کنیم
                     const payingUser = await User.findById(telegramId).lean();
                     if (!payingUser) {
                            throw new Error('کاربر پرداخت‌کننده یافت نشد');
                     }
                     const userTelegramNumber = payingUser.telegramId; // این همان عددی است که در targetMember ذخیره شده

                     // حذف این عدد از آرایه targetMember
                     await MonthlyCharge.findByIdAndUpdate(chargeId, {
                            $pull: { targetMember: userTelegramNumber },
                            $set: {
                                   status: (await MonthlyCharge.findById(chargeId)).targetMember.filter((m: any) => m !== userTelegramNumber).length === 0 ? 'completed' : 'partial',
                                   updatedAt: new Date()
                            }
                     });
                     // ========== مرحله 6: ثبت تراکنش ==========
                     const datee = new Date()
                     await Transaction.create({
                            userId: telegramId,
                            buildingId: charge.buildingId,
                            amount: tempPayment.amount,
                            type: charge.title,
                            description: description || `پرداخت شارژ ${charge.title}`,
                            status: 'completed',
                            paymentMethod: 'card',
                            referenceId: existingPurchase.transactionId,//کد پیگری
                            completedAt: datee
                     })



                     // 7. حذف رکورد موقت
                     await TempPayment.deleteOne({ _id: tempPayment._id });
                     try {
                            await User.findOneAndUpdate({ phoneNumber: existingPurchase.phoneNumber }, { role: 'admin', botState: 'awaiting_building_name' })
                     } catch (error) {
                            // بهینه کن
                            return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));

                     }
                     return NextResponse.redirect(new URL(`${BASE_URL}/payment/success`, req.url));
              } else {
                     console.log("Payment failed with code:", verification.data?.code);

                     // پرداخت ناموفق – وضعیت را به failed تغییر می‌دهیم (اختیاری)
                     await Purchase.updateOne(
                            { _id: tempPayment.purchaseId, status: "pending" },
                            { $set: { status: "failed" } }
                     );
                     await TempPayment.deleteOne({ _id: tempPayment._id });
                     return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
              }
       } catch (error) {
              console.error("Verification error:", error);
              // در صورت خطای شبکه یا خطای سرور، رکورد موقت را حذف نکنید (اجازه دهید کاربر دوباره تلاش کند)
              return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed`, req.url));
       }
}