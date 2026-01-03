//src\app\api\telegram\charges\monthly\route.ts
import { dbConnect } from '@/app/api/mongodb';
import BotGroup from '@/app/models/BotGroup';
import Building from '@/app/models/Building';
import MonthlyCharge from '@/app/models/MonthlyCharge';
import User from '@/app/models/User';
import { ChargeTypes, getPersianChargeName, getPersianMonthName, MONTHS } from '@/hooks/database';
import bot from '@/telegram/bot';
import mongoose from 'mongoose';
// import { MonthlyCharge } from '@/app/models/MonthlyCharge';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale'; // برای نام ماه‌های فارسی

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


// ثابت‌ها (خارج از تابع برای استفاده مجدد)

// تعریف نوع داده ورودی
interface ChargeRequest {
    buildingId: string;
    title: typeof ChargeTypes[number];
    month: typeof MONTHS[number];
    year: number;
    totalAmount: number;
    dueDate: string;
    targetMember?: string[];
    adminId: number;
}

export async function POST(request: NextRequest) {
    try {
        // اتصال به دیتابیس
        await dbConnect()

        // دریافت داده‌ها
        const body: ChargeRequest = await request.json()

        // اعتبارسنجی داده‌ها
        const { buildingId, title, month, year, totalAmount, dueDate, targetMember = [], adminId } = body;

        // اعتبارسنجی یکپارچه
        if (!buildingId || !title || !month || !year || !totalAmount || !dueDate) {
            return NextResponse.json({ message: 'تمامی فیلدهای الزامی را پر کنید' }, { status: 400 });
        }
        if (!MONTHS.includes(month)) {
            return NextResponse.json({ message: 'ماه نامعتبر است' }, { status: 400 });
        }
        if (!ChargeTypes.includes(title as any)) {
            return NextResponse.json({ message: 'نوع شارژ نامعتبر است' }, { status: 400 });
        }



        // تبدیل buildingId به ObjectId با هندل خطا
        let buildingObjectId: mongoose.Types.ObjectId;
        try {
            buildingObjectId = new mongoose.Types.ObjectId(buildingId);
        } catch {
            return NextResponse.json({ message: 'شناسه ساختمان نامعتبر است' }, { status: 400 });
        }

        //    - بررسی تکراری بودن شارژ
        //    - یافتن کاربر ادمین بر اساس telegramId
        const [existingCharge, adminUser] = await Promise.all([
            MonthlyCharge.findOne({
                buildingId: buildingObjectId,
                month,
                year,
                title,
            })
                .lean() // افزایش سرعت
                .exec(),

            User.findOne({ telegramId: adminId })
                .select('_id')
                .lean()
                .exec(),
        ]);

        // 6. بررسی تکراری
        if (existingCharge) {
            return NextResponse.json(
                { message: 'شارژ برای این ماه و سال قبلاً ثبت شده است' },
                { status: 409 }
            );
        }

        // 7. بررسی وجود ادمین
        if (!adminUser) {
            return NextResponse.json(
                { message: 'ادمین یافت نشد' },
                { status: 404 }
            );
        }
        // 8. یافتن گروه مربوط به این ادمین (با استفاده از ObjectId کاربر)
        const botGroup = await BotGroup.findOne({ adminId: adminUser._id })
            .select('chatId')
            .lean()
            .exec();

        // ایجاد رکورد جدید
        const newCharge = await MonthlyCharge.create({
            buildingId: buildingObjectId,
            title,
            month,
            year,
            totalAmount,
            dueDate: new Date(dueDate),
            status: targetMember.length > 0 ? 'pending' : 'completed',
            targetMember,
            createdAt: new Date(),
        });
        const perMonth = getPersianMonthName(month)
        const perCharge = getPersianChargeName(title)
        // در بخش ارسال پیام
        const dueDateObj = new Date(dueDate);
        const formattedDueDate = format(dueDateObj, 'dd MMMM yyyy', { locale: faIR });

        // 10. ارسال پیام به گروه (بدون await برای عدم تأخیر پاسخ)
        if (botGroup) {
            const messageText = `
📌 *شارژ ${perCharge} جدید ثبت شد*

📅 سال: ${year} - ماه: ${perMonth}
💰 مبلغ کل: ${totalAmount?.toLocaleString()} تومان
📆 تاریخ سررسید: ${formattedDueDate || 'تعیین نشده'}
تعداد افرادی که پرداخت نکردن: ${targetMember.length}
      `.trim();

            bot.telegram
                .sendMessage(botGroup.chatId, messageText, { parse_mode: 'Markdown' })
                .then(() => console.log(`Message sent to group ${botGroup.chatId}`))
                .catch((err: Error) =>
                    console.error('Failed to send message:', err.message)
                );
        } else {
            console.warn('No BotGroup found for admin', adminId);
        }

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
                    targetMemberCount: newCharge.targetMember.length || 0
                }
            },
            { status: 201 }
        )

    } catch (error: any) {
        console.error('خطا در ثبت شارژ:', error);

        // در محیط توسعه جزئیات خطا را نشان بده
        const message =
            process.env.NODE_ENV === 'development'
                ? error.message
                : 'خطای سرور';

        return NextResponse.json(
            { message: 'خطای سرور', error: message },
            { status: 500 }
        );
    }
}
