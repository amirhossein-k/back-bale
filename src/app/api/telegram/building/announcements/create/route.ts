import { NextResponse } from 'next/server';
import { validateInitData } from '@/lib/validate';
import { dbConnect } from '@/app/api/mongodb';
import Building from '@/app/models/Building';
import Announcement from '@/app/models/Announcement';
// ۳.۶. ایجاد اعلان (مدیر)

export async function POST(request: any) {
    try {
        await dbConnect();
        const { initData, buildingId, title, content } = await request.json();

        const validation = await validateInitData(initData);
        if (!validation) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const managerId = validation.userId;

        const building = await Building.findOne({ _id: buildingId, managerId });
        if (!building) {
            return NextResponse.json({ error: 'Building not found or not yours' }, { status: 404 });
        }

        await Announcement.create({ buildingId, title, content });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
