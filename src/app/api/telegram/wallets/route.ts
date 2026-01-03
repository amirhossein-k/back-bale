// src\app\api\telegram\wallets\route.ts

import { dbConnect } from '../../mongodb';
import MonthlyCharge from '@/app/models/MonthlyCharge';
import { Wallet } from '@/app/models/Wallet';
import { bildingType } from '@/store/Slice/BaleDateSlice';
import { NextRequest, NextResponse } from 'next/server';

interface SendMessageRequest {
       title: string;
       bildingsId: bildingType[];

}
// Building schema
// bildingsId: [
//        {_id:BUILDING => _id => objectId ,managerId (مدیر ساختمان): 'USER => _id => objectId' ,chatIdGroup:4555}, //ساختمان1
//        {_id:BUILDING => _id => objectId ,managerId (مدیر ساختمان): 'USER => _id => objectId' ,chatIdGroup:5889} // ساختمان 2
// ]
export async function POST(req: Request) {

       try {

              const body: SendMessageRequest = await req.json()
              const { title, bildingsId } = body

              if (!title || !bildingsId) return NextResponse.json({ error: 'title و bildingsId الزامی' }, { status: 400 });
              await dbConnect();

              const wallets = await Wallet.find()
              const listManagerId = bildingsId.map(bilding => bilding.managerId)

              return NextResponse.json({ data: { wallets, listManagerId } }, { status: 200 });
       } catch (error: any) {
              console.error(error);
              const message =
                     process.env.NODE_ENV === 'development'
                            ? error.message
                            : 'خطای سرور';

              return NextResponse.json(
                     { message: 'خطای سرور', error: message },
                     { status: 500 }
              );
       }
}
