
// app/api/charges/payments/route.ts

import { dbConnect } from "@/app/api/mongodb";
import Building from "@/app/models/Building";
// import { Payment } from "@/app/models/MonthlyCharge";
import { NextRequest, NextResponse } from "next/server";

// GET: دریافت وضعیت پرداخت‌های یک ماه
export async function GET(request: NextRequest) {
    try {
        // await dbConnect();
        // const { searchParams } = new URL(request.url);
        // const chargeId = searchParams.get('chargeId');
        // const buildingId = searchParams.get('buildingId');
        // const status = searchParams.get('status'); // paid/unpaid/all

        // const query: any = {};
        // if (chargeId) query.chargeId = chargeId;
        // if (buildingId) query.buildingId = buildingId;
        // if (status === 'paid') query.status = 'approved';
        // if (status === 'unpaid') query.status = { $ne: 'approved' };

        // const payments = await Payment.find(query)
        //     .populate('userId', 'fullName unitNumber')
        //     .sort({ paidAt: -1 })
        //     .lean();

        // // دریافت لیست تمام اعضای ساختمان
        // const building = await Building.findById(buildingId).lean();
        // const allMembers = building?.members || [];

        // // ترکیب اطلاعات پرداخت با اعضا
        // const result = allMembers.map((member: any) => {
        //     const payment = payments.find((p: any) => p.userId === member.userId);
        //     return {
        //         userId: member.userId,
        //         fullName: member.fullName,
        //         unitNumber: member.unitNumber,
        //         hasPaid: !!payment && payment.status === 'approved',
        //         payment: payment ? {
        //             amount: payment.amount,
        //             paidAt: payment.paidAt,
        //             method: payment.paymentMethod,
        //             receiptImage: payment.receiptImage,
        //         } : null,
        //     };
        // });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'خطا در دریافت اطلاعات' },
            { status: 500 }
        );
    }
}