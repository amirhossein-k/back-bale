import { NextResponse } from 'next/server';
import { validateInitData } from '@/lib/validate';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import User from '@/app/models/User';
import BuildingMember from '@/app/models/BuildingMember';


export async function POST(request: any) {
    try {
        await dbConnect();
        const { initData, memberTelegramId, buildingId } = await request.json();

        const validation = await validateInitData(initData);
        if (!validation) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const managerId = validation.userId;

        // بررسی مالکیت ساختمان
        const building = await Building.findOne({ _id: buildingId, managerId });
        if (!building) {
            return NextResponse.json({ error: 'Building not found or not yours' }, { status: 404 });
        }

        // یافتن کاربری که عضو می‌شود
        const member = await User.findOne({ telegramId: memberTelegramId });
        if (!member) {
            return NextResponse.json({ error: 'User not registered in bot' }, { status: 404 });
        }

        // جلوگیری از عضویت تکراری
        const existing = await BuildingMember.findOne({ userId: member._id, buildingId });
        if (existing) {
            return NextResponse.json({ error: 'Already a member' }, { status: 409 });
        }

        await BuildingMember.create({ userId: member._id, buildingId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
