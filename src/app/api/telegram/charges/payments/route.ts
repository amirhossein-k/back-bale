
// src\app\api\telegram\charges\payments\route.ts

import { dbConnect } from "@/app/api/mongodb";
import Building from "@/app/models/Building";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import { Transaction } from "@/app/models/Transaction";
// import { Payment } from "@/app/models/MonthlyCharge";
import { NextRequest, NextResponse } from "next/server";
const API_URL = `https://tapi.bale.ai/bot1141850488:chb9KioVVst6Z_LuWLRKW_aZ2RaiPyjEYJ4/createInvoiceLink`;

// GET: دریافت وضعیت پرداخت‌های یک ماه
export async function POST(request: Request) {
    try {
        const { chargeId,
            userId,
            buildingId, } = await request.json();


        console.log(buildingId, 'buildingId')
        if (!chargeId || !userId || !buildingId) {
            return NextResponse.json(
                { success: false, error: "Failed to create invoice" },
                { status: 400 }
            );
        }
        await dbConnect();

        const charge = await MonthlyCharge.findById(chargeId);
        if (!charge) {
            return NextResponse.json(
                { success: false, error: "یافت نشد" },
                { status: 404 }
            );
        }
        console.log(charge, 'charge')

        // بررسی وجود userId در targetMember
        const index = charge.targetMember.indexOf(userId.toString());
        if (index === -1) {
            return NextResponse.json({ error: 'کاربر در لیست بدهکاران نیست یا قبلاً پرداخت کرده' }, { status: 400 });
        }
        console.log(index, 'index')

        // ارسال پیام برای پرداخت به فرایند پرداخت برود:
        // chatId= telegramId
        // const payload  = `order_${userId}_${Date.now()}_`

        // حذف userId از targetMember
        charge.targetMember.splice(index, 1);

        // به‌روزرسانی status
        if (charge.targetMember.length === 0) {
            charge.status = 'completed';
        } else {
            charge.status = 'partial';
        }
        await charge.save();

        // ثبت تراکنش
        await Transaction.create({
            userId,
            buildingId,
            type: charge.title,
            amount: charge.totalAmount,
            description: `پرداخت ${charge.title} ${charge.month}/${charge.year}`,
            status: 'completed',
            paymentMethod: 'bale_wallet', // یا هر روشی
            completedAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'پرداخت با موفقیت انجام شد' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error },
            { status: 500 }
        );
    }
}