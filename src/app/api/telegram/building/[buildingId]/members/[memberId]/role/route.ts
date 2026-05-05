// src\app\api\telegram\building\[buildingId]\members\[memberId]\role\route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from "@/app/models/BuildingMember";
import Building from "@/app/models/Building";
import User from "@/app/models/User";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ buildingId: any; memberId: any }> }
) {
    try {
        await dbConnect();

        const { buildingId, memberId } = await params;

        // ── اعتبارسنجی ObjectId ──
        if (
            !mongoose.Types.ObjectId.isValid(buildingId) ||
            !mongoose.Types.ObjectId.isValid(memberId)
        ) {
            return NextResponse.json(
                { error: "شناسه ساختمان یا عضو نامعتبر است" },
                { status: 400 }
            );
        }

        // ── دریافت body ──
        const body = await request.json();
        const { role, userId } = body;

        // ── اعتبارسنجی فیلدهای ارسالی ──
        if (!role || !userId) {
            return NextResponse.json(
                { error: "نقش و شناسه کاربر الزامی است" },
                { status: 400 }
            );
        }

        if (!["admin", "member"].includes(role)) {
            return NextResponse.json(
                { error: "نقش باید admin یا member باشد" },
                { status: 400 }
            );
        }

        // if (!mongoose.Types.ObjectId.isValid(userId)) {
        //     return NextResponse.json(
        //         { error: "شناسه کاربر نامعتبر است" },
        //         { status: 400 }
        //     );
        // }

        // ── یافتن عضویت ──
        const membership = await BuildingMember.findById(memberId);
        if (!membership) {
            return NextResponse.json(
                { error: "عضویت یافت نشد" },
                { status: 404 }
            );
        }

        // ── بررسی تعلق عضویت به ساختمان ──
        // if (membership.buildingId.toString() !== Userid._id.toString()) {
        //     return NextResponse.json(
        //         { error: "این عضو متعلق به ساختمان مشخص‌شده نیست" },
        //         { status: 400 }
        //     );
        // }

        // ── اخذ مجوز (بررسی اینکه کاربر درخواست‌کننده مدیر ساختمان است) ──
        const building = await Building.findById(buildingId).select("managerId");
        if (!building) {
            return NextResponse.json(
                { error: "ساختمان یافت نشد" },
                { status: 404 }
            );
        }
        const userAmin = await User.findOne({ telegramId: userId, role: "admin" }).select('_id')
        console.log(userAmin, 'userAmin')
        console.log(userAmin._id, 'userAmin._id')
        console.log(building.managerId, 'building.managerId')
        // کاربر درخواست‌کننده باید مدیر ساختمان باشد (یا role کلی admin باشد – آینده)
        if (building.managerId.toString() !== userAmin._id.toString()) {
            return NextResponse.json(
                { error: "شما مجوز تغییر نقش را ندارید" },
                { status: 403 }
            );
        }

        // ── به‌روزرسانی نقش ──
        membership.role = role;
        await membership.save();

        return NextResponse.json({
            success: true,
            message: "نقش با موفقیت تغییر یافت",
            membership,
        });
    } catch (error: any) {
        console.error("Error in PATCH role:", error);
        return NextResponse.json(
            { error: error.message || "خطای داخلی سرور" },
            { status: 500 }
        );
    }
}
