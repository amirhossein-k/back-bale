import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/api/mongodb";
import { Transaction } from "@/app/models/Transaction";
import User from "@/app/models/User";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
       await dbConnect();
       const searchParams = req.nextUrl.searchParams;
       const buildingId = searchParams.get("buildingId");
       const search = searchParams.get("search");
       const startDate = searchParams.get("startDate");
       const endDate = searchParams.get("endDate");
       const cursor = searchParams.get("cursor");
       const limit = parseInt(searchParams.get("limit") || "10");
       const type = searchParams.get("type"); // اضافه کنید

       if (!buildingId || !Types.ObjectId.isValid(buildingId)) {
              return NextResponse.json({ error: "buildingId نامعتبر" }, { status: 400 });
       }
       const matchStage: any = {
              buildingId: new Types.ObjectId(buildingId),
              status: "completed",
       };

       if (startDate || endDate) {
              matchStage.completedAt = {};
              if (startDate) matchStage.completedAt.$gte = new Date(startDate);
              if (endDate) matchStage.completedAt.$lte = new Date(endDate);
       }
       if (type) {
              matchStage.type = type;
       }

       // جستجو بر اساس نام کاربر یا شماره تماس
       if (search) {
              const users = await User.find({
                     $or: [
                            { firstName: { $regex: search, $options: "i" } },
                            { lastName: { $regex: search, $options: "i" } },
                            { phoneNumber: { $regex: search, $options: "i" } },
                     ],
              }).select("_id");
              const userIds = users.map((u) => u._id.toString());
              matchStage.userId = { $in: userIds };
       }

       if (cursor) {
              matchStage._id = { $lt: new Types.ObjectId(cursor) };
       }

       // مجموع کل مبلغ
       const totalAmountAgg = await Transaction.aggregate([
              { $match: matchStage },
              { $group: { _id: null, total: { $sum: "$amount" } } },
       ]);
       const totalAmount = totalAmountAgg[0]?.total || 0;

       // دریافت تراکنش‌ها با اطلاعات کاربران
       const transactions = await Transaction.aggregate([
              { $match: matchStage },
              { $sort: { _id: -1 } },
              { $limit: limit + 1 },
              {
                     $addFields: {
                            userIdObj: { $toObjectId: "$userId" }, // تبدیل رشته به ObjectId
                     },
              },
              {
                     $lookup: {
                            from: "users",
                            localField: "userIdObj", // ← استفاده از فیلد تبدیل‌شده
                            foreignField: "_id",
                            as: "user",
                     },
              },
              { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
              {
                     $project: {
                            _id: 1,
                            userId: "$user.telegramId",
                            userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
                            phoneNumber: "$user.phoneNumber",
                            amount: 1,
                            completedAt: 1,
                            referenceId: 1,
                            type: 1, // اضافه شد

                     },
              },
       ]);

       const hasNextPage = transactions.length > limit;
       const nextCursor = hasNextPage ? transactions[transactions.length - 2]?._id : null;
       const resultTransactions = hasNextPage ? transactions.slice(0, -1) : transactions;

       return NextResponse.json({
              transactions: resultTransactions,
              totalAmount,
              nextCursor: nextCursor ? nextCursor.toString() : null,
              hasNextPage,
       });
}