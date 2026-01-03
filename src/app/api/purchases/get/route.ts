// app/api/purchases/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../mongodb";
import Purchase from "@/app/models/Purchase";


export async function GET(req: NextRequest) {
       await dbConnect();
       const codeYekta = req.nextUrl.searchParams.get("codeYekta");
       if (!codeYekta) {
              return NextResponse.json({ success: false, message: "codeYekta required" }, { status: 400 });
       }
       const purchase = await Purchase.findOne({ codeYekta });
       if (!purchase) {
              return NextResponse.json({ success: false, message: "Purchase not found" }, { status: 404 });
       }
       return NextResponse.json({ success: true, data: { phoneNumber: purchase.phoneNumber, status: purchase.status, } });
}