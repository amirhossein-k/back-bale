
// app/api/charges/receipt/route.ts

import { dbConnect } from "@/app/api/mongodb";
import { Payment } from "@/app/models/MonthlyCharge";
import { NextResponse } from "next/server";

// POST: آپلود رسید پرداخت
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('receiptImage') as File;
    const userId = formData.get('userId');
    const buildingId = formData.get('buildingId');
    const chargeId = formData.get('chargeId');
    const text = formData.get('text');
    const amount = formData.get('amount');

    // آپلود تصویر (می‌توانید از سرویس‌های مختلف استفاده کنید)
    const imageUrl = await uploadToStorage(image); // تابع آپلود

    // ذخیره پرداخت
    await dbConnect();
    const payment = await Payment.create({
      buildingId,
      chargeId,
      userId,
      amount,
      receiptImage: imageUrl,
      receiptText: text,
      paymentMethod: 'receipt',
      status: 'pending',
      paidAt: new Date(),
    });

    // اطلاع به ادمین‌ها
    await notifyAdmins(buildingId, {
      type: 'new_receipt',
      paymentId: payment._id,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'رسید با موفقیت ارسال شد و در انتظار تایید ادمین می‌باشد',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطا در ارسال رسید' },
      { status: 500 }
    );
  }
}