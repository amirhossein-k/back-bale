import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import Purchase from "@/app/models/Purchase";
import TempPayment from "@/app/models/TempPayment";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import Building from "@/app/models/Building";
import { Wallet } from "@/app/models/Wallet";
import { Transaction } from "@/app/models/Transaction";

export async function GET(req: NextRequest) {
       await dbConnect();
       const searchParams = req.nextUrl.searchParams;
       const chargeId = searchParams.get("chargeId");
       const purchaseId = searchParams.get("purchaseId");
       const telegramId = searchParams.get("telegramId");
       const description = searchParams.get("description");

       if (!chargeId || !purchaseId || !telegramId) {
              return NextResponse.json({ error: "پارامترهای کافی نیست" }, { status: 400 });
       }

       // 1. به‌روزرسانی Purchase
       const purchase = await Purchase.findByIdAndUpdate(
              purchaseId,
              {
                     status: "paid",
                     transactionId: `TEST_${Date.now()}`,
                     paymentGateway: "test",
                     paidAt: new Date(),
                     verified: true,
              },
              { new: true }
       );

       if (!purchase) {
              return NextResponse.json({ error: "Purchase یافت نشد" }, { status: 404 });
       }

       // 2. دریافت شارژ و ساختمان
       const charge = await MonthlyCharge.findById(chargeId);
       if (!charge) return NextResponse.json({ error: "شارژ یافت نشد" }, { status: 404 });

       const building = await Building.findById(charge.buildingId).populate("managerId");
       if (!building) return NextResponse.json({ error: "ساختمان یافت نشد" }, { status: 404 });

       const managerId = building.managerId._id;
       const amountInTomans = (purchase.amount || 0) / 10;

       // 3. به‌روزرسانی کیف پول مدیر
       await Wallet.findOneAndUpdate(
              { userId: managerId },
              {
                     $inc: { balance: amountInTomans, totalDeposited: amountInTomans },
                     $setOnInsert: { buildingId: charge.buildingId, status: "active", createdAt: new Date() },
              },
              { upsert: true }
       );

       // 4. حذف کاربر از targetMember
       const newTarget = (charge.targetMember || []).filter((id: any) => id.toString() !== telegramId);
       const newStatus = newTarget.length === 0 ? "completed" : "partial";
       await MonthlyCharge.findByIdAndUpdate(chargeId, {
              $set: { targetMember: newTarget, status: newStatus, updatedAt: new Date() },
       });

       // 5. ثبت تراکنش تستی
       await Transaction.create({
              userId: telegramId,
              buildingId: charge.buildingId,
              amount: amountInTomans,
              type: charge.title,
              description: description || `پرداخت تست ${charge.title}`,
              status: "completed",
              paymentMethod: "test",
              referenceId: `TEST_${Date.now()}`,
              completedAt: new Date(),
       });

       // 6. حذف رکورد موقت (در صورت وجود)
       await TempPayment.deleteOne({ purchaseId: purchase._id });

       return NextResponse.redirect(new URL(`/payment/success?test=true`, req.url));
}