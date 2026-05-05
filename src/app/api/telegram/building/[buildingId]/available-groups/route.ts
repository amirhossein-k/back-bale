// src\app\api\telegram\building\[buildingId]\available-groups\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import User from '@/app/models/User';
import BotGroup from '@/app/models/BotGroup';


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ buildingId: any }> }
) {
    try {
        await dbConnect();
        const { buildingId } = await params;
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        console.log(userId, 'userId')
        // 1. اعتبارسنجی کاربر و بررسی دسترسی مدیر ساختمان
        const user = await User.findOne({ telegramId: userId });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        console.log(user, 'user')
        const building = await Building.findById(buildingId);
        if (!building) return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        console.log(building, 'user')

        const isManager = building.managerId.toString() === user._id.toString();
        console.log(isManager, 'isManager')
        const isAdmin = building.members.some(
            (m: any) => m.toString() === user._id.toString()
        );
        console.log(isAdmin, 'isAdmin')
        if (!isManager && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. دریافت تمام گروه‌هایی که ربات عضو است
        const botGroups = await BotGroup.find({ adminId: user._id }).select('chatId title type');
        // const availableGroups: any[] = [];
        // availableGroups.push(botGroups)
        // 

        return NextResponse.json({ groups: botGroups });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
