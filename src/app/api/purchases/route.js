import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Purchase from "@/models/Purchase";
import Plan from "@/models/Plan";
import { generateActivationCode } from "@/utils/generateActivationCode";
// api/purchases/route.js (POST - ایجاد خرید جدید)

export async function POST(request) {
  try {
    const body = await request.json();
    const { planId, phoneNumber } = body;

    // اعتبارسنجی
    if (!planId || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: "پلن و شماره تلفن الزامی است" },
        { status: 400 },
      );
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "شماره تلفن معتبر نیست (مثال: 09123456789)",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // بررسی وجود پلن
    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, message: "پلن مورد نظر یافت نشد" },
        { status: 404 },
      );
    }

    // تولید کد فعالسازی یکتا
    let activationCode;
    let isUnique = false;
    while (!isUnique) {
      activationCode = generateActivationCode();
      const existing = await Purchase.findOne({ activationCode });
      if (!existing) isUnique = true;
    }

    // محاسبه تاریخ انقضا
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // ایجاد خرید
    const purchase = await Purchase.create({
      planId: plan._id,
      planName: plan.name,
      phoneNumber,
      activationCode,
      amount: plan.price,
      status: "pending",
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "خرید با موفقیت ایجاد شد",
        data: {
          purchaseId: purchase._id,
          activationCode: purchase.activationCode,
          amount: purchase.amount,
          planName: purchase.planName,
          status: purchase.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ایجاد خرید" },
      { status: 500 },
    );
  }
}
