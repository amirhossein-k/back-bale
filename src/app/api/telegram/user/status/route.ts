// src\app\api\telegram\user\status\route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from '@/app/models/BuildingMember'
import Building from "@/app/models/Building";
import User from "@/app/models/User";

export async function POST(request: any) {
  try {
    await dbConnect();
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    // 1️⃣ اول یوزر را با Telegram ID پیدا کن
    const telegramId = Number(userId);

    const user = await User.findOne({ telegramId }).lean();

    if (!user) {
      // کاربر در دیتابیس ثبت‌نام نکرده است
      return NextResponse.json({
        role: "none",
        buildings: [],
      });
    }

    const allBilding = await Building.find().select('_id managerId chatIdGroup').lean();

    const mongoUserId = user._id; // MongoDB ObjectId واقعی

    // ساختمان‌هایی که کاربر مدیر آنهاست
    const managedBuildings = await Building.find({ managerId: mongoUserId }).lean();

    // عضویت‌ها
    const memberships = await BuildingMember.find({ userId: mongoUserId })
      .populate<{ buildingId: any }>("buildingId")
      .lean();

    const memberBuildings = memberships
      .filter((m: any) => m.buildingId)
      .map((m: any) => ({
        id: m.buildingId._id.toString(),
        name: m.buildingId.name,
        address: m.buildingId.address,
      }));

    // اگر مدیر بود
    if (managedBuildings.length > 0) {
      return NextResponse.json({
        role: "manager",
        mongoUserId,
        buildings: managedBuildings.map((b) => ({
          id: b._id.toString(),
          name: b.name,
          address: b.address,
        })),
      });
    }
    // اگر عضو ساختمانی بود
    else if (memberBuildings.length > 0) {
      return NextResponse.json({
        role: "user",
        mongoUserId,
        buildings: memberBuildings
      });
    } else if (user.role === 'modir') {
      return NextResponse.json({
        role: "modir",
        mongoUserId,
        buildings: [],
        bilding: allBilding
      });
    }
    // اگر نه عضو ساختمانی بود و نه پلنی خریده بود
    else {
      return NextResponse.json({
        role: "none",
        mongoUserId: null,
        buildings: []
        // hasPurchase: purchases.length > 0,
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
