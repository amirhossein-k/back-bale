// app/api/charges/monthly/route.ts
import { dbConnect } from '@/app/api/mongodb';
import { MonthlyCharge } from '@/app/models/MonthlyCharge';
import { NextRequest, NextResponse } from 'next/server';

// GET: دریافت لیست شارژهای ماهانه
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get('buildingId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        const query: any = {};
        if (buildingId) query.buildingId = buildingId;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const charges = await MonthlyCharge.find(query)
            .sort({ year: -1, month: -1 })
            .lean();

        return NextResponse.json({ success: true, data: charges });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'خطا در دریافت اطلاعات' },
            { status: 500 }
        );
    }
}
