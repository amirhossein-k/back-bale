// src\app\api\telegram\charges\monthly\route.ts
import { dbConnect } from '@/app/api/mongodb';
import MonthlyCharge from '@/app/models/MonthlyCharge';
import mongoose from 'mongoose';
// import { MonthlyCharge } from '@/app/models/MonthlyCharge';
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



// تعریف نوع داده ورودی
interface ChargeRequest {
    buildingId: string
    title: 'charge' | 'electricity' | 'water' | 'Facilities' | 'extra'
    month: string
    year: number
    totalAmount: number
    dueDate: string
    targetMember: string[]
}

export async function POST(request: NextRequest) {
    try {
        // اتصال به دیتابیس
        await dbConnect()

        // دریافت داده‌ها
        const body: ChargeRequest = await request.json()

        // اعتبارسنجی داده‌ها
        const { buildingId, title, month, year, totalAmount, dueDate, targetMember } = body

        if (!buildingId || !title || !month || !year || !totalAmount || !dueDate) {
            return NextResponse.json(
                { message: 'تمامی فیلدهای الزامی را پر کنید' },
                { status: 400 }
            )
        }

        // اعتبارسنجی ماه
        const validMonths = ['far', 'ordi', 'khor', 'tir', 'mor', 'shahr', 'mehr', 'aban', 'azar', 'dey', 'bahman', 'esfand']
        if (!validMonths.includes(month)) {
            return NextResponse.json(
                { message: 'ماه نامعتبر است' },
                { status: 400 }
            )
        }

        // اعتبارسنجی title
        const validTitles = ['charge', 'electricity', 'water', 'Facilities', 'extra']
        if (!validTitles.includes(title)) {
            return NextResponse.json(
                { message: 'نوع شارژ نامعتبر است' },
                { status: 400 }
            )
        }

        // تبدیل buildingId به ObjectId
        let buildingObjectId
        try {
            buildingObjectId = new mongoose.Types.ObjectId(buildingId)
        } catch {
            return NextResponse.json(
                { message: 'شناسه ساختمان نامعتبر است' },
                { status: 400 }
            )
        }

        // بررسی وجود رکورد تکراری برای همان ساختمان، ماه و سال
        const existingCharge = await MonthlyCharge.findOne({
            buildingId: buildingObjectId,
            month,
            year,
            title
        })

        if (existingCharge) {
            return NextResponse.json(
                { message: 'شارژ برای این ماه و سال قبلاً ثبت شده است' },
                { status: 409 }
            )
        }

        // ایجاد رکورد جدید
        const newCharge = new MonthlyCharge({
            buildingId: buildingObjectId,
            title,
            month,
            year,
            totalAmount,
            dueDate: new Date(dueDate),
            status: targetMember.length > 0 ? 'pending' : 'completed',
            targetMember: targetMember || [],
            createdAt: new Date()
        })

        await newCharge.save()

        return NextResponse.json(
            {
                message: 'شارژ با موفقیت ثبت شد',
                data: {
                    id: newCharge._id,
                    title: newCharge.title,
                    month: newCharge.month,
                    year: newCharge.year,
                    totalAmount: newCharge.totalAmount,
                    dueDate: newCharge.dueDate,
                    status: newCharge.status,
                    targetMemberCount: newCharge.targetMember.length
                }
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('خطا در ثبت شارژ:', error)

        return NextResponse.json(
            {
                message: 'خطای سرور',
                error: error instanceof Error ? error.message : 'خطای ناشناخته'
            },
            { status: 500 }
        )
    }
}
