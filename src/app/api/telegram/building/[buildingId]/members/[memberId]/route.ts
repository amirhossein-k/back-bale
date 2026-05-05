import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from "@/app/models/BuildingMember";
import Building from "@/app/models/Building";
import User from "@/app/models/User"; // ✅ اضافه شده

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ buildingId: string; memberId: string }> }
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
        const { userId } = body; // userId در واقع telegramId است

        if (!userId) {
            return NextResponse.json(
                { error: "شناسه کاربر درخواست‌کننده الزامی است" },
                { status: 400 }
            );
        }

        // ── یافتن کاربر بر اساس telegramId ──
        const requester = await User.findOne({ telegramId: userId }).select("_id");
        if (!requester) {
            return NextResponse.json(
                { error: "کاربر درخواست‌کننده یافت نشد" },
                { status: 404 }
            );
        }

        // ── یافتن عضویت ──
        const membership = await BuildingMember.findById(memberId);
        if (!membership) {
            return NextResponse.json(
                { error: "عضویت یافت نشد" },
                { status: 404 }
            );
        }

        // ── بررسی تعلق عضویت به ساختمان ──
        if (membership.buildingId.toString() !== buildingId) {
            return NextResponse.json(
                { error: "این عضو متعلق به ساختمان مشخص‌شده نیست" },
                { status: 400 }
            );
        }

        // ── اخذ مجوز (مدیر ساختمان یا ادمین) ──
        const building = await Building.findById(buildingId).select("managerId members");
        if (!building) {
            return NextResponse.json(
                { error: "ساختمان یافت نشد" },
                { status: 404 }
            );
        }

        // مقایسه با _id کاربر بدست آمده از telegramId
        const isManager = building.managerId.toString() === requester._id.toString();

        // (اختیاری) ادمین‌ها نیز مجاز باشند
        // const isAdmin = await BuildingMember.findOne({ buildingId, userId: requester._id, role: "admin" });

        if (!isManager) {
            return NextResponse.json(
                { error: "شما مجوز حذف عضو را ندارید" },
                { status: 403 }
            );
        }
        const targetUserId = membership.userId;
        // ── حذف از BuildingMember ──
        await BuildingMember.findByIdAndDelete(memberId);

        // ── حذف کاربر از آرایه members در Building ──
        const userObjectId = membership.userId; // از عضویت گرفته می‌شود
        await Building.findByIdAndUpdate(buildingId, {
            $pull: { members: userObjectId },
        });

        // ✅ به‌روزرسانی نقش کاربر به 'none' به جای حذف کامل
        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            { role: 'none' },
            { new: true }
        );

        if (!updatedUser) {
            console.warn(`کاربر با شناسه  در Users یافت نشد، اما عضویت حذف شد.`);
            // در صورت نیاز می‌توانید خطا برگردانید
        }



        return NextResponse.json({
            success: true,
            message: "عضو با موفقیت از ساختمان حذف شد",
        });
    } catch (error: any) {
        console.error("Error in DELETE member:", error);
        return NextResponse.json(
            { error: error.message || "خطای داخلی سرور" },
            { status: 500 }
        );
    }
}
