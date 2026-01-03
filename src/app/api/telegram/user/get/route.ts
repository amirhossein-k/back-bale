// src\app\api\telegram\user\get\route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from '@/app/models/BuildingMember'
import Building from "@/app/models/Building";
import User from "@/app/models/User";
import { OptionalUserModelType } from "@/types/user";

export type getUserQuery = Pick<OptionalUserModelType, 'botState' | "cardNumber" | 'phoneNumber' | "role" | "telegramId" | "_id" | "nameBuilding">

export async function POST(request: any) {
       try {
              await dbConnect();
              const { userId } = await request.json();

              if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
              // 1️⃣ اول یوزر را با Telegram ID پیدا کن
              const telegramId = Number(userId);

              const user: getUserQuery = await User.findOne({ telegramId }).populate('botState cardNumber phoneNumber role telegramId _id nameBuilding').lean();

              if (!user) {
                     // کاربر در دیتابیس ثبت‌نام نکرده است
                     return NextResponse.json({
                            role: "none",
                            buildings: [],
                     });
              }







              return NextResponse.json(user);

       } catch (error) {
              console.error(error);
              return NextResponse.json(
                     { error: "Internal server error" },
                     { status: 500 },
              );
       }
}
