// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
       const { pathname } = request.nextUrl;

       // ✅ مسیرهایی که نیاز به محافظت دارند
       const protectedPaths = [
              '/dashboard',
              '/profile',
              '/checkout',
              '/payment',
              '/subscription', '/cart'
       ];

       const isProtected = protectedPaths.some(path =>
              pathname.startsWith(path)
       );

       if (isProtected) {
              // 1️⃣ چک لاگین بودن (JWT Token)
              const token = await getToken({
                     req: request,
                     secret: process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY ?? 'secretkey2338wfef@h',
              });

              const isLoggedIn = !!token;


              // ❌ اگر لاگین نکرده، دسترسی ممنوع (حتی اگر کوکی selectedPlan داشته باشد)
              if (!isLoggedIn) {
                     const url = new URL('/login', request.url);
                     url.searchParams.set('callbackUrl', pathname);
                     return NextResponse.redirect(url);
              }

       }

       return NextResponse.next();
}

export const config = {
       matcher: [
              '/dashboard/:path*',
              '/profile/:path*',
              '/checkout/:path*',
              '/payment/:path*',
              '/subscription/:path*',
       ],
};
