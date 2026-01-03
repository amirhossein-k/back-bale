// src\app\api\telegram\charges\route.ts

//api= /api/charges?title={title}&buildingId={buildingId}

import { dbConnect } from '../../mongodb';
import MonthlyCharge from '@/app/models/MonthlyCharge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request) {

    try {

        const { searchParams } = new URL(req.url);
        const title = searchParams.get('title');
        const buildingId = searchParams.get('buildingId');


        if (!title || !buildingId) return NextResponse.json({ error: 'title و buildingId الزامی' }, { status: 400 });
        await dbConnect();

        const charges = await MonthlyCharge.find({
            title: title as string,
            buildingId: buildingId as string,
        })
            .sort({ year: -1, month: -1 })
            .lean();

        const result = charges.map(charge => {

            return {
                ...charge,

                isFullyPaid: charge.status === 'completed',

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
// {
//     "data": [
//         {
//             "_id": "...",
//             "title": "شارژ فروردین",
//             "buildingId": "abc123",
//             "amount": 500000,
//             "status": "completed",
//             "isFullyPaid": true
//         }
//     ]
// }