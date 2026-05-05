
// app/api/charges/send-reminder/route.ts

import { NextRequest, NextResponse } from "next/server";

// POST: ارسال اخطار به کاربری که پرداخت نکرده
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { chargeId, userIds, buildingId } = body;

        // ارسال پیام به کاربران از طریق ربات
        const BOT_TOKEN = process.env.BALE_BOT_TOKEN;

        for (const userId of userIds) {
            await fetch(`https://tapi.bale.ai/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: userId,
                    text: `⚠️ *اخطار پرداخت شارژ*\n\n`
                        + `کاربر گرامی، شارژ ماه جاری شما هنوز پرداخت نشده است.\n`
                        + `لطفاً در اسرع وقت نسبت به پرداخت اقدام فرمایید.\n\n`
                        + `برای پرداخت و ارسال رسید، از دکمه زیر استفاده کنید:`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📤 ارسال رسید پرداخت', callback_data: 'send_receipt' }],
                            [{ text: '💰 پرداخت آنلاین', callback_data: 'online_payment' }],
                        ],
                    },
                }),
            });
        }

        return NextResponse.json({ success: true, message: 'اخطار با موفقیت ارسال شد' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'خطا در ارسال اخطار' },
            { status: 500 }
        );
    }
}