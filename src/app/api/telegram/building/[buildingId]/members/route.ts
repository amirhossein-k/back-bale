// src/app/api/telegram/building/[buildingId]/members/route.ts
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from "@/app/models/BuildingMember";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ buildingId: string; }> }
) {
    try {
        await dbConnect();

        const { buildingId } = await params;
        console.log(buildingId, 'buildingId api')
        if (!buildingId) {
            return NextResponse.json(
                { error: "شناسه ساختمان الزامی است" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(buildingId)) {
            return NextResponse.json(
                { error: "شناسه ساختمان نامعتبر است" },
                { status: 400 }
            );
        }

        const memberships = await BuildingMember.find({ buildingId })
            .populate("userId") // یا populate("userId") بسته به نیاز
            .lean();

        return NextResponse.json({ members: memberships });
    } catch (error) {
        console.error("Error in GET members:", error);
        return NextResponse.json(
            { error: "خطا در دریافت اعضا" },
            { status: 500 }
        );
    }
}
