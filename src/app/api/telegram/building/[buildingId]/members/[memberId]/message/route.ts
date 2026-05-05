import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/app/api/mongodb";
import BuildingMember from "@/app/models/BuildingMember";
import Building from "@/app/models/Building";
import User from "@/app/models/User";
import bot from "@/telegram/bot";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ buildingId: any; memberId: any }> }

) {
    try {
        await dbConnect();

        const { buildingId, memberId } = await params;

        // ── اعتبارسنجی شناسه‌ها ──
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
        const { text, channel, userId } = body;

        if (!text || !text.trim()) {
            return NextResponse.json(
                { error: "متن پیام الزامی است" },
                { status: 400 }
            );
        }
        console.log(userId, 'userId message')
        // if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        //     return NextResponse.json(
        //         { error: "شناسه کاربر درخواست‌کننده نامعتبر است" },
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
        console.log(membership, 'membership')
        // ── بررسی تعلق به ساختمان ──
        if (membership.buildingId.toString() !== buildingId) {
            return NextResponse.json(
                { error: "این عضو متعلق به ساختمان مشخص‌شده نیست" },
                { status: 400 }
            );
        }

        // ── اخذ مجوز (مدیر ساختمان یا ادمین) ──
        const building = await Building.findById(buildingId).select("managerId");
        if (!building) {
            return NextResponse.json(
                { error: "ساختمان یافت نشد" },
                { status: 404 }
            );
        }
        const isAdmin = await BuildingMember.findOne({
            buildingId,
            // userId,
            role: "admin",
        });

        if (!isAdmin) {
            return NextResponse.json(
                { error: "شما مجوز ارسال پیام به این عضو را ندارید" },
                { status: 403 }
            );
        }

        // ── دریافت اطلاعات کاربر مقصد (عضو) ──
        const targetUser = await User.findById(membership.userId).select("telegramId");
        if (!targetUser || !targetUser.telegramId) {
            return NextResponse.json(
                { error: "کاربر مورد نظر در بله یافت نشد یا تلفن همراه ثبت نشده است" },
                { status: 404 }
            );
        }

        // ── ارسال پیام از طریق ربات بله ──
        let sendResult;

        // روش اول: استفاده از Telegraf (اگر bot از این کتابخانه است)
        try {
            const textAdmin = 'پیامی از طرف مدیر ساختمان:\n'
            await bot.telegram.sendMessage(targetUser.telegramId, textAdmin.concat(text as string).trim());
            sendResult = { success: true };
        } catch (telegramError: any) {
            console.error("خطا در ارسال پیام از طریق Telegraf:", telegramError);
            // روش دوم: ارسال مستقیم با fetch (در صورت عدم موفقیت روش اول)
            try {
                const botToken = process.env.BOT_TOKEN; // توکن ربات
                const url = `https://tapi.bale.ai/bot${botToken}/sendMessage`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: targetUser.telegramId,
                        text: text.trim(),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.description || "خطا در API بله");
                }
                sendResult = { success: true };
            } catch (directError: any) {
                return NextResponse.json(
                    { error: `ارسال پیام ناموفق: ${directError.message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: "پیام با موفقیت ارسال شد",
            data: sendResult,
        });
    } catch (error: any) {
        console.error("Error in POST send message:", error);
        return NextResponse.json(
            { error: error.message || "خطای داخلی سرور" },
            { status: 500 }
        );
    }
}
