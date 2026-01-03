//src\app\api\telegram\charges\adminSee\route.tss

//api= /api/charges/adminSee?title={title}&buildingId={buildingId}
import { NextApiRequest, NextApiResponse } from 'next';

import MonthlyCharge from '@/app/models/MonthlyCharge';
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';

export default async function GET(req: NextRequest) {

    try {
        // ✅ خواندن از URL SearchParams (نه body)
        const { searchParams } = new URL(req.url);
        const title = searchParams.get('title');
        const buildingId = searchParams.get('buildingId');

        // ✅ validation
        if (!title || !buildingId) {
            return NextResponse.json(
                { error: 'title و buildingId الزامی است' },
                { status: 400 }
            );
        }
        await dbConnect();

        const charges = await MonthlyCharge.find({
            title: title as string,
            buildingId: buildingId as string,
        })
            .sort({ year: -1, month: -1 })
            .lean();

        // الحاق نام اعضا (در صورت وجود Member model)
        let memberMap = new Map<string, { firstName?: string; lastName?: string }>();
        try {
            const allMembers = await Member.find({ buildingId }).select('telegramId firstName lastName').lean();
            memberMap = new Map(allMembers.map(m => [m.telegramId, { firstName: m.firstName, lastName: m.lastName }]));
        } catch { /* ignore if Member model does not exist */ }

        const result = charges.map(charge => {

            return {
                ...charge,

                isFullyPaid: charge.status === 'completed',
                targetMembers: (charge.targetMember || []).map(tgId => ({
                    telegramId: tgId,
                    ...(memberMap.get(tgId) || {}),
                })),
            };
        });

        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
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
