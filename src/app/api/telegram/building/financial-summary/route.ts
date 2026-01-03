// src\app\api\telegram\building\financial-summary\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Expense from '@/app/models/Expense';
import { Types } from 'mongoose';
import { Transaction } from '@/app/models/Transaction';

export async function GET(req: NextRequest) {
       try {
              await dbConnect();
              const searchParams = req.nextUrl.searchParams;
              const buildingId = searchParams.get('buildingId');

              if (!buildingId || !Types.ObjectId.isValid(buildingId)) {
                     return NextResponse.json({ error: 'buildingId نامعتبر است' }, { status: 400 });
              }

              const objectId = new Types.ObjectId(buildingId);

              // جمع کل درآمدها (تراکنش‌های موفق با نوع شارژ)
              const incomeAgg = await Transaction.aggregate([
                     {
                            $match: {
                                   buildingId: objectId,
                                   status: 'completed',
                                   type: 'charge', // فقط پرداخت‌های شارژ ساختمان
                            },
                     },
                     {
                            $group: {
                                   _id: null,
                                   total: { $sum: '$amount' },
                            },
                     },
              ]);
              const totalIncome = incomeAgg[0]?.total || 0;

              // جمع کل هزینه‌ها (Expense)
              const expenseAgg = await Expense.aggregate([
                     { $match: { buildingId: objectId } },
                     {
                            $group: {
                                   _id: null,
                                   total: { $sum: '$amount' },
                            },
                     },
              ]);
              const totalExpense = expenseAgg[0]?.total || 0;

              // (اختیاری) جزئیات بیشتر به تفکیک ماه/دسته‌بندی برای نمودار
              const incomeByMonth = await Transaction.aggregate([
                     {
                            $match: {
                                   buildingId: objectId,
                                   status: 'completed',
                                   type: 'charge',
                            },
                     },
                     {
                            $group: {
                                   _id: {
                                          year: { $year: '$completedAt' },
                                          month: { $month: '$completedAt' },
                                   },
                                   amount: { $sum: '$amount' },
                            },
                     },
                     { $sort: { '_id.year': 1, '_id.month': 1 } },
              ]);

              const expenseByMonth = await Expense.aggregate([
                     { $match: { buildingId: objectId } },
                     {
                            $group: {
                                   _id: {
                                          year: { $year: '$date' },
                                          month: { $month: '$date' },
                                   },
                                   amount: { $sum: '$amount' },
                            },
                     },
                     { $sort: { '_id.year': 1, '_id.month': 1 } },
              ]);

              return NextResponse.json({
                     success: true,
                     data: {
                            totalIncome,
                            totalExpense,
                            balance: totalIncome - totalExpense,
                            incomeByMonth,
                            expenseByMonth,
                     },
              });
       } catch (error) {
              console.error('Financial summary error:', error);
              return NextResponse.json({ error: 'خطای داخلی سرور' }, { status: 500 });
       }
}