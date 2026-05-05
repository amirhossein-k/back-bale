import { dbConnect } from '@/app/api/mongodb';
import ReferralCommission from '@/app/models/ReferralCommission';
import User from '@/app/models/User';
import { NextRequest, NextResponse } from 'next/server';

// فرض کنید یک کاربر با telegramId=12345 درخواست آمار خود را می‌دهد. می‌توانید با ارسال درخواست زیر آن را تست کنید:

// GET /api/referral/stats?telegramId=12345
// {
//   "totalCommission": 15000,
//   "pendingCommission": 10000,
//   "commissions": [
//     {
//       "_id": "...",
//       "referrer": "userId",
//       "referred": {
//         "firstName": "علی",
//         "lastName": "رضایی",
//         "telegramId": 67890
//       },
//       "amount": 5000,
//       "status": "pending",
//       "createdAt": "2025-01-15T10:30:00Z"
//     }
//   ]
// }

export async function GET(req: NextRequest) {
    try {
        // احراز هویت: این بخش به معماری پروژه شما بستگی دارد
        // در اینجا فرض می‌کنیم که token کاربر در هدر Authorization یا کوکی ارسال می‌شود
        // یا از clerk / next-auth استفاده می‌کنید.
        // برای مثال، اگر کاربر از طریق query string شناسایی می‌شود (telegramId):
        const { searchParams } = new URL(req.url);
        const telegramId = searchParams.get('telegramId');

        if (!telegramId) {
            return NextResponse.json(
                { error: 'telegramId is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // یافتن کاربر
        const user = await User.findOne({ telegramId }).populate('referredBy', 'firstName lastName username');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // تمام کمیسیون‌هایی که این کاربر به‌عنوان مرجع دریافت کرده
        const commissions = await ReferralCommission.find({ referrer: user._id })
            .populate('referred', 'firstName lastName username telegramId')
            .sort({ createdAt: -1 })
            .lean();

        // آمار
        const totalCommission = user.totalCommission;        // کل کمیسیون ثبت‌شده
        const pendingCommission = user.pendingCommission;    // کمیسیون پرداخت‌نشده

        return NextResponse.json({
            totalCommission,
            pendingCommission,
            commissions
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
