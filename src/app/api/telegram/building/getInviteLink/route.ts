// src\app\api\telegram\building\getInviteLink\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import User from '@/app/models/User';
import { validateInitData } from '@/lib/validate';
// مدیر در مینی‌اپ دکمه‌ای دارد که لینک دعوت را دریافت می‌کند. این API بررسی می‌کند که مدیر واقعاً مدیر همان ساختمان است.


export async function POST(request: NextRequest) {
    try {
        const { buildingId, userId } = await request.json();

        console.log(buildingId, 'buildingId  ==> getInviteLink ')
        await dbConnect();

        // یافتن کاربر و ساختمان
        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
        }

        // console.log(`/api\telegram\building\getInviteLink == user ${user}`)
        const building = await Building.findById(buildingId);
        if (!building) {
            return NextResponse.json({ error: 'ساختمان یافت نشد' }, { status: 404 });
        }

        // فقط مدیر ساختمان می‌تواند لینک دعوت را ببیند
        if (building.managerId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
        }

        // اگر کد دعوت وجود ندارد، تولید کن
        if (!building.inviteCode) {
            building.inviteCode = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await building.save();
        }


        const botUsername = process.env.BOT_USERNAME; // مثلاً: mybuildingbot
        const inviteLink = `https://ble.ir/hamyarmarloobot?start=${building.inviteCode}`;

        return NextResponse.json({ inviteLink, inviteCode: building.inviteCode });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
    }
}
