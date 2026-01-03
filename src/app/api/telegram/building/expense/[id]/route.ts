import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/app/api/mongodb';
import Expense from '@/app/models/Expense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE: حذف هزینه
export async function DELETE(
       req: NextRequest,
       { params }: { params: { id: string } }
) {
       await dbConnect();
       const searchParams = req.nextUrl.searchParams;

       const buildingId = searchParams.get('buildingId');

       const { id } = params;
       if (!id && !buildingId) {
              return NextResponse.json({ error: 'ID required & buildingId' }, { status: 400 });
       }

       const expense = await Expense.findOneAndDelete({ _id: id, managerId: buildingId });
       if (!expense) {
              return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
       }

       return NextResponse.json({ success: true });
}

// PUT: ویرایش هزینه
export async function PUT(
       req: NextRequest,
       { params }: { params: { id: string } }
) {
       await dbConnect();

       const searchParams = req.nextUrl.searchParams;

       const buildingId = searchParams.get('buildingId');
       const { id } = params;
       const body = await req.json();
       const { title, amount, category, description, date } = body;

       if (!title || !amount || !category) {
              return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
       }

       const updatedExpense = await Expense.findOneAndUpdate(
              { _id: id, managerId: buildingId },
              {
                     title,
                     amount,
                     category,
                     description,
                     date: date ? new Date(date) : new Date(),
              },
              { new: true }
       );

       if (!updatedExpense) {
              return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
       }

       return NextResponse.json({ success: true, data: updatedExpense });
}