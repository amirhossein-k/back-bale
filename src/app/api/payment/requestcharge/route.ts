// src\app\api\payment\requestcharge

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "../../mongodb";
import ZarinPal from "zarinpal-node-sdk";           // ✅ default import (درست)
import { randomUUID } from 'crypto'; // اضافه شود
import { createHash } from 'crypto';
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

export async function POST(req: NextRequest) {    // ✅ NextRequest
  try {
    console.log("📥 Payment request received");



    // 2️⃣ اتصال به دیتابیس
    await dbConnect();
    console.log("✅ DB connected");

    // 3️⃣ دریافت body
    const body = await req.json();                // ✅ req.json() روی NextRequest
    const {
      phoenNumber,
      userId,
      title,
      description,
      totalAmount,

      chargeId
    } = body;

    if (!userId || !totalAmount || !chargeId) {
      return NextResponse.json(
        { error: "userId, totalAmount و chargeId الزامی هستند" },
        { status: 400 }
      );
    }
    // 4️⃣ import مدل‌ها (با try-catch مجزا)
    // Import مدل‌ها
    const Purchase = (await import("@/app/models/Purchase")).default;
    const TempPayment = (await import("@/app/models/TempPayment")).default;
    const MonthlyCharge = (await import("@/app/models/MonthlyCharge")).default; // فرض بر وجود مدل Charge

    // بررسی وجود شارژ معتبر
    const charge = await MonthlyCharge.findById(chargeId);
    if (!charge) {
      return NextResponse.json({ error: "شارژ یافت نشد" }, { status: 404 });
    }

    let purchase = await Purchase.findOne({
      userId,
      status: "pending",
      planName: title,
      phoneNumber: phoenNumber,
      activationCode: description
    });

    // 5️⃣ پیدا کردن purchase

    if (!purchase) {
      purchase = await Purchase.create({
        phoneNumber: phoenNumber, userId, planName: title, activationCode: description,
      })
      console.log("✅ Purchase found:", purchase._id);
    } else {
      console.log("✅ Existing purchase found:", purchase._id);
    }



    const amountInRials = Number(totalAmount) * 10;

    // const zarinpal = new ZarinPal({
    //   merchantId: process.env.ZARINPAL_MERCHANT_ID!,
    //   sandbox: false,
    // });
    // ///////////////////////////
    // const merchantId = "11111111-1111-1111-1111-1111111111112";
    // const dynamicMerchantId = randomUUID(); // UUID جدید برای هر درخواست
    const merchantId = generateUUIDFromIds(chargeId, userId);
    console.log(merchantId, 'merchantId req')
    const zarinpal = new ZarinPal({
      merchantId: merchantId,
      sandbox: true,
    });
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/verify-charge?chargeId=${chargeId}&purchaseId=${purchase._id}&telegramId=${userId}&description=${description}`
    // /////////////////////////////
    console.log(process.env.NEXTAUTH_URL, 'process.env.NEXTAUTH_URL')
    const paymentRequest = await zarinpal.payments.create({
      amount: amountInRials,                     // ✅ اطمینان از عدد بودن
      description: description,
      callback_url: callbackUrl,
      mobile: phoenNumber,
    });
    console.log("✅ Zarinpal response:", JSON.stringify(paymentRequest, null, 2));


    // ✅ دریافت Authority و ساخت redirect URL
    const authority = paymentRequest.data?.authority;
    if (!authority) {
      throw new Error(paymentRequest.errors?.message || "No authority received");
    }

    // const redirectUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;
    // /////////////////////////////
    const redirectUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;
    ///////////////////////////////////


    // 7️⃣ ذخیره موقت
    await TempPayment.create({
      purchaseId: purchase._id,
      authority,
      amount: amountInRials,
      planId: chargeId, // id monthlyCahrge
    });

    return NextResponse.json({
      redirectUrl
    });

  } catch (error: any) {
    console.error("❌ Error details:", {
      message: error.message,
      response: error.response?.data,

      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      // name: error.name,
    });

    return NextResponse.json(
      { error: error.response?.data?.errors?.message || error.message || "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
