// src\app\api\telegram\building\findgroup\[userId]\route.ts
import { dbConnect } from "@/app/api/mongodb";
import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/User";
import BotGroup from "@/app/models/BotGroup";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await dbConnect();

        const { userId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId (telegramId) is required' },
                { status: 400 }
            );
        }

        // ✅ 1. پیدا کردن کاربر با telegramId
        const user = await User.findOne({ telegramId: Number(userId) }).lean();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // ✅ 2. جستجوی گروه‌های ربات برای این کاربر (با adminId)
        const botGroups = await BotGroup
            .find({ adminId: user._id })
            .select('chatId')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                groups: botGroups,
                // total: botGroups.length,
            },
        });
    } catch (error) {
        console.error('Error in user groups:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
