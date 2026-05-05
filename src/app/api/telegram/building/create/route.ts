import { NextResponse } from 'next/server';
import { validateInitData } from '@/lib/validate';
import { dbConnect } from '@/app/api/mongodb';
import Purchase from '@/app/models/Purchase';
import Building from '@/app/models/Building';

export async function POST(request: any) {
  try {
    await dbConnect();
    const { initData, name, address } = await request.json();

    const validation = await validateInitData(initData);
    if (!validation) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = validation.userId;

    // بررسی خرید معتبر
    const purchase = await Purchase.findOne({ userId, plan: 'management', verified: true });
    if (!purchase) {
      return NextResponse.json({ error: 'No valid purchase found' }, { status: 403 });
    }

    // آیا قبلاً ساختمان دارد؟
    const existing = await Building.findOne({ managerId: userId });
    if (existing) {
      return NextResponse.json({ error: 'Already have a building' }, { status: 409 });
    }

    const building = await Building.create({
      name,
      address,
      managerId: userId,
    });

    return NextResponse.json({ success: true, building: { id: building._id.toString(), name } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
