// src\app\api\telegram\building\expense\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Expense from '@/app/models/Expense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/app/models/User';
import moment from 'moment-jalaali';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
       try {
              await dbConnect();


              const body = await req.json();
              const { buildingId, title, amount, category, description, date, managerId } = body;

              if (!buildingId || !title || !amount || !category || !managerId) {
                     return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
              }
              // managerId در واقع telegramId است، پس باید کاربر را پیدا کنیم
              const user = await User.findOne({ telegramId: managerId });
              if (!user) {
                     return NextResponse.json({ error: 'User not found' }, { status: 404 });
              }

              const expense = await Expense.create({
                     buildingId,
                     managerId: user._id,
                     title,
                     amount,
                     category,
                     description,
                     date: date ? new Date(date) : new Date(),
              });

              return NextResponse.json({ success: true, data: expense });
       } catch (error) {
              console.error('POST /api/expenses error:', error);
              return NextResponse.json(
                     { error: 'Internal server error' },
                     { status: 500 }
              );
       }
}
// دریافت لیست هزینه‌ها با فیلتر سال و ماه
export async function GET(req: NextRequest) {
       try {
              await dbConnect();
              const searchParams = req.nextUrl.searchParams;
              const buildingId = searchParams.get('buildingId');
              const startDateStr = searchParams.get('startDateStr');
              const endDateStr = searchParams.get('endDateStr');
              const managerTelegramId = searchParams.get('managerId');

              if (!buildingId) {
                     return NextResponse.json({ error: 'buildingId required' }, { status: 400 });
              }

              // ✅ تبدیل buildingId به ObjectId
              const matchStage: any = {
                     buildingId: new mongoose.Types.ObjectId(buildingId)
              };

              // ---------- فیلتر مدیر (تبدیل telegramId به ObjectId) ----------
              if (managerTelegramId) {
                     const user = await User.findOne({ telegramId: Number(managerTelegramId) });
                     if (!user) {
                            console.warn(`❌ User with telegramId ${managerTelegramId} not found`);
                            return NextResponse.json({ success: true, data: [] });
                     }
                     matchStage.managerId = user._id;
                     console.log(`✅ User found: ${user._id} with telegramId ${managerTelegramId}`);
              } else {
                     console.warn('⚠️ No managerId provided');
              }

              // ---------- فیلتر بازه تاریخ (با تبدیل به UTC) ----------
              if (startDateStr && endDateStr) {
                     // ساخت تاریخ‌های UTC برای جلوگیری از جابجایی منطقه زمانی
                     const start = new Date(`${startDateStr}T00:00:00.000Z`);
                     const end = new Date(`${endDateStr}T23:59:59.999Z`);

                     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
                     }

                     matchStage.date = { $gte: start, $lte: end };
                     console.log(`📅 Date range: ${start.toISOString()} -> ${end.toISOString()}`);
              }

              // ---------- اجرای aggregation ----------
              const expenses = await Expense.aggregate([
                     { $match: matchStage },
                     { $sort: { date: -1 } },
                     {
                            $group: {
                                   _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                                   expenses: { $push: '$$ROOT' },
                                   totalAmount: { $sum: '$amount' }
                            }
                     },
                     { $sort: { '_id.year': -1, '_id.month': -1 } }
              ]);

              console.log(`📊 Found ${expenses.length} expense groups`);

              // ---------- تبدیل سال/ماه میلادی به شمسی برای نمایش ----------
              const persianMonths = [
                     'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                     'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
              ];
              const expensesWithJalali = expenses.map(group => {
                     const gregorianDate = new Date(group._id.year, group._id.month - 1, 1);
                     const jalali = moment(gregorianDate);
                     return {
                            ...group,
                            jalaliYear: jalali.jYear(),
                            jalaliMonth: jalali.jMonth() + 1,
                            jalaliMonthName: persianMonths[jalali.jMonth()]
                     };
              });

              return NextResponse.json({ success: true, data: expensesWithJalali });
       } catch (error) {
              console.error('🔥 GET /api/expenses error:', error);
              return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
       }
}