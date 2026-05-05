import { NextResponse } from 'next/server';
import { validateInitData } from '@/lib/validate';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import BuildingMember from '@/app/models/BuildingMember';
import Announcement from '@/app/models/Announcement';

// ۳.۵. اعلان‌ها (دریافت)
export async function GET(request: any) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const initData = searchParams.get('initData');
        const buildingId = searchParams.get('buildingId');

        if (!initData || !buildingId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const validation = await validateInitData(initData);
        if (!validation) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = validation.userId;

        // بررسی دسترسی
        const isManager = await Building.findOne({ _id: buildingId, managerId: userId });
        const isMember = await BuildingMember.findOne({ userId, buildingId });

        if (!isManager && !isMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const announcements = await Announcement.find({ buildingId }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ announcements });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
