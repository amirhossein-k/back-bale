// lib/notifyAdmin.ts

import bot from "@/telegram/bot";
import { Markup } from "telegraf";

const ADMIN_TELEGRAM_ID = 1616176632;

export async function notifyAdmin(amount: number, cardNumber: string, fullName?: string, requestId?: any) {
    try {
        const message = `
💰 **درخواست برداشت جدید**
━━━━━━━━━━━━━━━
💵 مبلغ: ${amount.toLocaleString()} تومان
💳 شماره کارت: ${cardNumber}
👤 نام صاحب حساب: ${fullName || "ثبت نشده"}
━━━━━━━━━━━━━━━
⏳ وضعیت: نیاز به بررسی و واریز دستی
    `;
        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("✅ تأیید واریز", `complete_${requestId}`),
            Markup.button.callback("❌ رد درخواست", `reject_${requestId}`),
        ]);


        await bot.telegram.sendMessage(ADMIN_TELEGRAM_ID, message, {
            parse_mode: "Markdown",
            ...keyboard,
        });
    } catch (error) {
        console.error("خطا در ارسال پیام به ادمین:", error);
    }
}


interface NotificationData {
    type: 'new_payment_receipt' | 'receipt_verified' | 'receipt_rejected' | 'payment_reminder' | 'system_alert';
    userId: string;
    paymentId?: string;
    fileId?: string;
    amount?: number;
    userName?: string;
    buildingName?: string;
    verifiedBy?: string;
}
/**
 * ارسال اطلاعیه تلگرام
 */
export async function sendTelegramNotification(
    telegramId: string,
    notification: NotificationData,
    adminName: string
): Promise<void> {
    try {
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN not found');
        }

        const message = formatTelegramMessage(notification, adminName);

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Telegram API error:`, error);
        }

    } catch (error) {
        console.error(`Failed to send Telegram notification to ${telegramId}:`, error);
    }
}

/**
 * فرمت‌بندی پیام تلگرام
 */
function formatTelegramMessage(notification: NotificationData, adminName: string): string {
    const emojiMap = {
        new_payment_receipt: '📤',
        receipt_verified: '✅',
        receipt_rejected: '❌',
        payment_reminder: '⏰',
        system_alert: '🚨',
    };

    const emoji = emojiMap[notification.type] || '📢';
    let message = '';

    switch (notification.type) {
        case 'new_payment_receipt':
            message = `
<b>${emoji} رسید پرداخت جدید</b>

👤 کاربر: ${notification.userName || 'کاربر'}
🏢 ساختمان: ${notification.buildingName || 'ساختمان شما'}
💰 مبلغ: ${notification.amount ? notification.amount.toLocaleString() + ' تومان' : 'نامشخص'}
📄 کد پیگیری: ${notification.paymentId || 'نامشخص'}

📝 توضیحات کاربر:
${notification.fileId ? 'فایل پیوست شده است' : 'بدون توضیحات'}

⏰ ${new Date().toLocaleString('fa-IR')}

${adminName} عزیز، لطفا رسید را بررسی و تایید کنید.
      `;
            break;

        default:
            message = `
<b>${emoji} اطلاعیه سیستم</b>

نوع: ${notification.type}
کاربر: ${notification.userId}
زمان: ${new Date().toLocaleString('fa-IR')}
      `;
    }

    return message.trim();
}
