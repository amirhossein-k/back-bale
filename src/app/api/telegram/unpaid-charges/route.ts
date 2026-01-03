import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import MonthlyCharge from "@/app/models/MonthlyCharge";
import User from "@/app/models/User";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
       try {
              await dbConnect();
       } catch (error) {
              console.error("Database connection error:", error);
              return NextResponse.json(
                     { success: false, error: "خطا در اتصال به پایگاه داده" },
                     { status: 500 }
              );
       }

       const searchParams = req.nextUrl.searchParams;
       const buildingId = searchParams.get("buildingId");

       if (!buildingId) {
              return NextResponse.json(
                     { success: false, error: "buildingId الزامی است" },
                     { status: 400 }
              );
       }
       if (!Types.ObjectId.isValid(buildingId)) {
              return NextResponse.json(
                     { success: false, error: "buildingId نامعتبر است" },
                     { status: 400 }
              );
       }

       try {
              // دریافت شارژهای پرداخت نشده (pending یا partial) که targetMember خالی نباشد
              const charges = await MonthlyCharge.find({
                     buildingId: new Types.ObjectId(buildingId),
                     status: { $in: ["pending", "partial"] },
                     "targetMember.0": { $exists: true },
              }).lean();

              const result = [];

              for (const charge of charges) {
                     try {
                            // targetMember در دیتابیس ممکن است رشته (telegramId) باشد یا عدد
                            // آن را به آرایه‌ای از اعداد (Number) تبدیل می‌کنیم
                            const telegramIds = (charge.targetMember || [])
                                   .map((id: any) => {
                                          const num = Number(id);
                                          return isNaN(num) ? null : num;
                                   })
                                   .filter((id: number | null) => id !== null);

                            if (telegramIds.length === 0) continue;

                            // جستجوی کاربران بر اساس telegramId
                            const users = await User.find({ telegramId: { $in: telegramIds } }).select(
                                   "telegramId firstName lastName phoneNumber"
                            );

                            if (users.length === 0) continue;

                            result.push({
                                   chargeId: charge._id,
                                   title: charge.title,
                                   month: charge.month,
                                   year: charge.year,
                                   totalAmount: charge.totalAmount,
                                   status: charge.status,
                                   unpaidMembers: users.map((user) => ({
                                          _id: user._id,
                                          telegramId: user.telegramId,
                                          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "کاربر بدون نام",
                                          phoneNumber: user.phoneNumber || "ثبت نشده",
                                   })),
                            });
                     } catch (err) {
                            console.error(`Error processing charge ${charge._id}:`, err);
                            // ادامه می‌دهیم (یک شارژ مشکل داشته باشد بقیه را از دست نمی‌دهیم)
                     }
              }

              return NextResponse.json({ success: true, data: result });
       } catch (error) {
              console.error("Error fetching unpaid charges:", error);
              return NextResponse.json(
                     { success: false, error: "خطا در دریافت اطلاعات شارژهای پرداخت نشده" },
                     { status: 500 }
              );
       }
}