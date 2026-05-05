// app/api/telegram/send-to-group/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

// تایپ برای درخواست
interface SendMessageRequest {
    chatId: number;
    text: string;
    userId?: string;

}

// تایپ برای پاسخ
interface SendMessageResponse {
    success: boolean;
    messageId?: number;
    error?: string;
    timestamp?: string;
}

// مقداردهی اولیه bot (استفاده از متغیر محیطی)
const BOT_TOKEN = process.env.BOT_TOKEN
if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
}


const bot = new Telegraf(process.env.BOT_TOKEN!, {
    telegram: {
        apiRoot: 'https://tapi.bale.ai',  // آدرس API بله
        // اختیاری: اگر نیاز به proxy دارید
        // agent: new HttpsProxyAgent('http://proxy:port')
    }
});
export async function POST(request: NextRequest) {
    try {
        // بررسی متد
        if (request.method !== 'POST') {
            return NextResponse.json(
                { success: false, error: 'Method not allowed' },
                { status: 405 }
            );
        }

        // خواندن بدنه درخواست
        const body: SendMessageRequest = await request.json();

        // اعتبارسنجی داده‌ها
        if (!body.chatId || !body.text) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'chatId and text are required'
                },
                { status: 400 }
            );
        }

        // اعتبارسنجی userId (اختیاری)
        if (body.userId) {
            // می‌توانید بررسی کنید که آیا کاربر مجاز است یا نه
            // اینجا می‌توانید از دیتابیس یا سیستم احراز هویت استفاده کنید
            console.log(`Sending message for user: ${body.userId}`);
        }

        // ارسال پیام
        const result = await bot.telegram.sendMessage(
            body.chatId,
            body.text,

        );

        // پاسخ موفقیت‌آمیز
        const response: SendMessageResponse = {
            success: true,
            messageId: result.message_id,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error('Error sending message:', error);

        // مدیریت خطاهای مختلف
        let errorMessage = 'خطا در ارسال پیام';
        let statusCode = 500;

        if (error.response) {
            // خطای API تلگرام/Bale
            const { error_code, description } = error.response;

            switch (error_code) {
                case 400:
                    errorMessage = 'شناسه چت نامعتبر است';
                    statusCode = 400;
                    break;
                case 403:
                    errorMessage = 'ربات از گروه اخراج شده یا دسترسی ندارد';
                    statusCode = 403;
                    break;
                case 429:
                    errorMessage = 'محدودیت نرخ ارسال پیام. لطفاً کمی صبر کنید';
                    statusCode = 429;
                    break;
                default:
                    errorMessage = description || 'خطای API تلگرام';
            }
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'خطای اتصال به سرور تلگرام';
        } else if (error.message?.includes('chat not found')) {
            errorMessage = 'گروه یافت نشد';
            statusCode = 404;
        } else if (error.message?.includes('bot was blocked')) {
            errorMessage = 'ربات توسط کاربر مسدود شده است';
            statusCode = 403;
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: statusCode }
        );
    }
}

// متدهای دیگر
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
    );
}
