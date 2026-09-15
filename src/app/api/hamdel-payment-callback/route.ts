// app/api/hamdel-payment-callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
       const authority =
              req.nextUrl.searchParams.get('Authority');

       const status =
              req.nextUrl.searchParams.get('Status');

       const redirectUrl =
              `https://hamdel.netlify.app/api/payment/verify` +
              `?Authority=${authority}` +
              `&Status=${status}`;

       return NextResponse.redirect(redirectUrl);
}