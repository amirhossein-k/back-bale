// src\app\api\telegram\route.ts
// import bot from "../../../app/telegram/bot"; // ✅ اصلاح شد
import bot from '@/telegram/bot';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // لاگ برای دیباگ
        console.log('📩 Webhook received:', JSON.stringify(body, null, 2));

        await bot.handleUpdate(body);

        // بهتر است از NextResponse استفاده کنید
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("❌ Error in POST handler:", err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // بررسی وجود URL
        if (!process.env.NEXT_PUBLIC_URL) {
            throw new Error("NEXT_PUBLIC_URL is not defined");
        }

        const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/telegram`;
        console.log(`🔗 Setting webhook to: ${webhookUrl}`);

        // تنظیم Webhook با پارامترهای کامل
        const result = await bot.telegram.setWebhook(webhookUrl, {
            max_connections: 40,
            // allowed_updates: ['message', 'callback_query']
        });

        console.log('✅ Webhook set result:', result);

        return NextResponse.json(
            {
                message: "✅ Webhook set successfully",
                url: webhookUrl,
                result: result
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("❌ Error setting webhook:", err);
        return NextResponse.json(
            {
                error: "❌ Error setting webhook",
                details: err.message
            },
            { status: 500 }
        );
    }
}
