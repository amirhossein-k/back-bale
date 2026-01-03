// src\app\api\telegram\invoice\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPersianChargeName } from "@/hooks/database";
const API_URL = `https://tapi.bale.ai/bot1141850488:chb9KioVVst6Z_LuWLRKW_aZ2RaiPyjEYJ4/createInvoiceLink`;

export async function POST(
    request: NextRequest,
) {
    try {
        const req = await request.json()
        const { TOKEN2, chatId, title, description, totalAmount, month, year, chargeId } = req
        const PerTitle = getPersianChargeName(title)
        console.log(PerTitle, 'PerTitle')
        const prices = [{
            label: PerTitle,
            amount: totalAmount
        }]
        console.log('TOKEN', TOKEN2)
        //chatId = tlegramId => USER schema
        //chargeId = id=> MonthlyCharge schema

        // prices: [
        //                 // برچسب خدمت یا کالا
        //                 { label: "پلن ویژه", amount: 20000 }, // ۵۰,۰۰۰ ریال
        //             ],
        //order_chatId_Date_typeEng_typePer_year_month
        //order               _360594256_1778171278959_Facilities_undefined_1405_ordi_69fcb663a5b21d208ce41713   
        const payload = `ordercharge_${chatId}_${Date.now()}_${title}_${PerTitle}_${year}_${month}_${chargeId}`;
        const invoiceData = {
            // chat_id: chatId,
            title: PerTitle,
            description,
            payload,
            provider_token: TOKEN2,
            // currency: 'IRR',
            prices
        };
        console.log(payload, "fedefef")
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
