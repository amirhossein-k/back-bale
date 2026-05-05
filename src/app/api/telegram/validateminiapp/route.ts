// src/app/api/telegram/validateminiapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/app/models/User';
import { dbConnect } from '../../mongodb';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const initData = body.initData as string;

        if (!initData) {
            return NextResponse.json({ ok: false, error: 'initData is required' }, { status: 400 });
        }

        const BOT_TOKEN = process.env.BOT_TOKEN!;
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();

        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');

        const checkString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        const computedHash = crypto.createHmac('sha256', secretKey)
            .update(checkString)
            .digest('hex');

        if (computedHash !== hash) {
            return NextResponse.json({ ok: false, error: 'Invalid data' }, { status: 403 });
        }

        const userStr = JSON.parse(params.get('user') || '{}');
        return NextResponse.json({ ok: true, userStr });


    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
