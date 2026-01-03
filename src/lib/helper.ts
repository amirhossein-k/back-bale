import { dbConnect } from "@/app/api/mongodb";
import { PaymentDocument, SaveReceiptToBaleInput } from "@/types/receipt";

// export async function saveReceiptToBale(
//     input: SaveReceiptToBaleInput
// ): Promise<PaymentDocument> {
//     try {

//         // 1. اعتبارسنجی ورودی‌ها
//         if (!input.userId || !input.buildingId || !input.fileId) {
//             throw new Error('Missing required fields: userId, buildingId, or fileId');
//         }

//         // 2. دریافت توکن و URL API از متغیرهای محیطی
//         const BOT_TOKEN = process.env.BOT_TOKEN;
//         if (!BOT_TOKEN) {
//             throw new Error('BALE_BOT_TOKEN is not configured');
//         }
//         await dbConnect()
//         // 3. دریافت اطلاعات فایل از API بله
//         const fileInfo = await getFileFromBale(input.fileId, BOT_TOKEN);

//         // 4. ساخت fileUrl برای دانلود مستقیم
//         const fileUrl = `https://tapi.bale.ai/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

//         const now = new Date();
//         // 7. ذخیره در دیتابس
//         // const result = await Payment.create({
//         //     userId: input.userId,
//         //     buildingId: input.buildingId,
//         //     fileId: input.fileId,
//         //     fileUrl: fileUrl,
//         //     caption: input.caption || '',
//         //     chatId: input.chatId,
//         //     amount: input.amount || 0,
//         //     status: 'pending' as const,
//         //     createdAt: now,
//         //     updatedAt: now,
//         //     verifiedAt: null,
//         //     verifiedBy: null,
//         //     adminNote: null,
//         // })

//         // if (!result.acknowledged) {
//         //     throw new Error('Failed to save payment document');
//         // }

//         // // 8. (اختیاری) به‌روزرسانی وضعیت شارژ ماهانه
//         // // await updateMonthlyChargeStatus(input.buildingId, input.userId);

//         // // 9. بازگرداندن سند ذخیره شده
//         // return result;
//         return 

//     } catch (error: any) {
//         console.error('Error in saveReceiptToBale:', error);
//         throw new Error(`Failed to save receipt: ${error.message}`);
//     }
// }

// تابع کمکی برای دریافت اطلاعات فایل از API بله
async function getFileFromBale(fileId: string, botToken: string): Promise<any> {
    try {
        const response = await fetch(`https://tapi.bale.ai/bot${botToken}/getFile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_id: fileId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Bale API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.ok || !data.result) {
            throw new Error(`Bale API returned error: ${data.description || 'Unknown error'}`);
        }

        return data.result;
    } catch (error: any) {
        console.error('Error getting file from Bale:', error);
        throw new Error(`Failed to get file info from Bale: ${error.message}`);
    }
}

// تابع کمکی برای به‌روزرسانی وضعیت شارژ ماهانه (اختیاری)
async function updateMonthlyChargeStatus(buildingId: string, userId: string): Promise<void> {
    try {
        const db = (global as any).db;
        const monthlyChargesCollection = db.collection('monthly_charges');

        // پیدا کردن شارژ ماهانه جاری
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        await monthlyChargesCollection.updateOne(
            {
                buildingId,
                month: currentMonth,
                year: currentYear,
                'payments.userId': userId,
            },
            {
                $set: {
                    'payments.$.status': 'pending',
                    'payments.$.updatedAt': new Date(),
                },
            }
        );
    } catch (error) {
        console.error('Error updating monthly charge status:', error);
        // خطا را نادیده بگیریم چون این عملیات اختیاری است
    }
}


export function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 رقمی
}
