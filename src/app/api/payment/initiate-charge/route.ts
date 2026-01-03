// src\app\api\payment\initiate-charge\route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import User from "@/app/models/User";
import Purchase from "@/app/models/Purchase";
import TempPayment from "@/app/models/TempPayment";
import Zarinpal from "zarinpal-node-sdk";
import { createHash, randomUUID } from "crypto";

const TITLES = [
       { value: "charge", label: "شارژ ساختمان" },
       { value: "electricity", label: "برق" },
       { value: "water", label: "آب" },
       { value: "Facilities", label: "امکانات" },
       { value: "extra", label: "متفرقه" },
] as const;

const MONTH_NAMES: Record<string, string> = {
       far: "فروردین",
       ordi: "اردیبهشت",
       khor: "خرداد",
       tir: "تیر",
       mor: "مرداد",
       shahr: "شهریور",
       mehr: "مهر",
       aban: "آبان",
       azar: "آذر",
       dey: "دی",
       bahman: "بهمن",
       esfand: "اسفند",
};

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
       try {
              await dbConnect();
              const searchParams = req.nextUrl.searchParams;
              const chargeId = searchParams.get("chargeId");
              const userId = searchParams.get("userId");
              const telegramId = searchParams.get("telegramId");
              if (!chargeId || !userId || !telegramId) {
                     return new NextResponse("اطلاعات ناقص است", { status: 400 });
              }

              // دریافت اطلاعات شارژ
              const charge = await MonthlyCharge.findById(chargeId).lean();
              if (!charge) {
                     return new NextResponse("شارژ یافت نشد", { status: 404 });
              }
              console.log(charge, 'charge starttt')

              // یافتن کاربر برای شماره موبایل
              const user = await User.findById(userId);
              if (!user || !user.phoneNumber) {
                     return new NextResponse("شماره تماس کاربر یافت نشد", { status: 404 });
              }
              const description = `پرداخت ${TITLES.find((t) => t.value === charge.title)?.label} - ${MONTH_NAMES[charge.month] || charge.month} ${charge.year}`;

              // یافتن یا ایجاد خرید (Purchase)
              let purchase = await Purchase.findOne({
                     userId,
                     status: "pending",
                     planName: charge.title,
                     phoneNumber: user.phoneNumber,
                     activationCode: description
              });
              console.log(purchase, 'purchase start')
              if (!purchase) {
                     purchase = await Purchase.create({
                            userId: userId,
                            phoneNumber: user.phoneNumber,
                            planName: charge.title,
                            activationCode: description,
                            // type: "charge",
                            amount: charge.totalAmount,
                     });
              }

              const amountInRials = Number(charge.totalAmount) * 10;

              // const zarinpal = new ZarinPal({
              //   merchantId: process.env.ZARINPAL_MERCHANT_ID!,
              //   sandbox: true,
              // });
              const merchantId = generateUUIDFromIds(chargeId, userId);

              // const dynamicMerchantId = randomUUID(); // UUID جدید برای هر درخواست
              const zarinpal = new Zarinpal({
                     merchantId: merchantId,
                     sandbox: true,
              });
              const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/verify-charge?chargeId=${chargeId}&purchaseId=${purchase._id}&telegramId=${userId}&description=${description}`;



              const paymentRequest = await zarinpal.payments.create({
                     amount: amountInRials,
                     description,
                     callback_url: callbackUrl,
                     mobile: user.phoneNumber,
              });

              const authority = paymentRequest.data?.authority;
              if (!authority) {
                     throw new Error("دریافت Authority از زرین‌پال ناموفق بود");
              }
              const redirectUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;

              // ذخیره موقت
              await TempPayment.create({
                     purchaseId: purchase._id,
                     authority,
                     amount: amountInRials,
                     planId: chargeId,
              });
              // const redirectUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;
              // /////////////////////////////
              ///////////////////////////////////

              return NextResponse.redirect(redirectUrl);
       } catch (error: any) {
              console.error("Initiate charge error:", error);
              return new NextResponse(`خطا در شروع پرداخت: ${error.message}`, { status: 500 });
       }
}