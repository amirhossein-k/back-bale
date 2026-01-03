// src/app/api/building/addMemberByPhone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import User from '@/app/models/User';
import { validateInitData } from '@/lib/validate';
import { Telegraf } from 'telegraf';

export async function POST(request: NextRequest) {
    try {
        const { initData, phoneNumber, buildingId } = await request.json();

        // 1. اعتبارسنجی مدیر
        const adminData = await validateInitData(initData);
        if (!adminData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 2. یافتن مدیر و ساختمان
        const admin = await User.findOne({ telegramId: adminData.userId });
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
        }

        const building = await Building.findById(buildingId);
        if (!building || building.adminId.toString() !== admin._id.toString()) {
            return NextResponse.json({ error: 'ساختمان یافت نشد' }, { status: 404 });
        }

        // 3. پاکسازی شماره (حذف + و فاصله)د
        const cleanPhone = phoneNumber.replace(/[\s+\-]/g, '');

        // 4. جستجوی کاربر با این شماره
        const member = await User.findOne({
            phoneNumber: { $regex: cleanPhone.replace('+', '\\+') }
        });

        if (!member) {
            return NextResponse.json({
                error: 'این شماره تلفن در سیستم ثبت نشده است. کاربر باید ابتدا شماره خود را با ربات به اشتراک بگذارد.'
            }, { status: 404 });
        }

        // 5. بررسی تکراری نبودن
        if (building.members.includes(member._id)) {
            return NextResponse.json({ error: 'این کاربر قبلاً عضو است' }, { status: 400 });
        }

        // 6. افزودن عضو
        building.members.push(member._id);
        await building.save();

        // 7. ارسال نوتیفیکیشن به عضو جدید
        const bot = new Telegraf(process.env.BOT_TOKEN!, {
            telegram: {
                apiRoot: 'https://tapi.bale.ai',  // آدرس API بله
                // اختیاری: اگر نیاز به proxy دارید
                // agent: new HttpsProxyAgent('http://proxy:port')
            }
        });
        await bot.telegram.sendMessage(member.telegramId,
            `🎉 شما به ساختمان "${building.name}" اضافه شدید!`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏢 مشاهده ساختمان', web_app: { url: `https://marloo.shop/dashboard` } }],
                    ],
                },
            }
        );

        return NextResponse.json({
            success: true,
            message: `عضو ${member.firstName || 'کاربر'} با موفقیت اضافه شد.`
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
    }
}
