// src\app\api\telegram\invoice\route.ts
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from "@/app/models/BuildingMember";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
const API_URL = `https://tapi.bale.ai/bot1141850488:chb9KioVVst6Z_LuWLRKW_aZ2RaiPyjEYJ4/createInvoiceLink`;
const API_URL2 = `https://tapi.bale.ai/bot1141850488:chb9KioVVst6Z_LuWLRKW_aZ2RaiPyjEYJ4/openInvoice`;


export async function POST(
    request: NextRequest,
) {
    try {
        const req = await request.json()
        const { TOKEN, orderType, chatId, title, description, prices } = req
        console.log('TOKEN', TOKEN)

        // prices: [
        //                 // برچسب خدمت یا کالا
        //                 { label: "پلن ویژه", amount: 20000 }, // ۵۰,۰۰۰ ریال
        //             ],
        const payload = `order_${chatId}_${Date.now()}_${orderType}`;
        const invoiceData = {
            chat_id: chatId,
            title,
            description,
            payload,
            provider_token: TOKEN,
            // currency: 'IRR',
            prices
            // پارامترهای اختیاری:
            // start_parameter: 'buy_plane',
            // need_name: true,
            // need_phone_number: true,
            // need_email: false,
            // is_flexible: false,
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceData),
        });

        const result = await response.json();
        if (result.ok && result.result) {
            // ✅ فقط invoiceLink را به فرانت برمی‌گردانیم
            return NextResponse.json({
                success: true,
                invoiceLink: result.result, // مثلاً: "invoice_id=8oPThxCePde8VdjrFLKm"
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Failed to create invoice" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Error in GET members:", error);
        return NextResponse.json(
            { error: "خطا در دریافت اعضا" },
            { status: 500 }
        );
    }
}
