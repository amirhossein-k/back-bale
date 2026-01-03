import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 }).lean();
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت پلن‌ها" },
      { status: 500 },
    );
  }
}
