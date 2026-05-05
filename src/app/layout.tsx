// src/app/layout.tsx
"use client";
import Script from "next/script";
import "./globals.css";
import Providers from "./Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* اسکریپت بله - اولین اسکریپت */}
        <Script
          src="https://tapi.bale.ai/miniapp.js?3"
          strategy="beforeInteractive"
          id="bale-sdk"
          onLoad={() => {
            // ارسال event برای اطلاع از بارگذاری SDK
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("bale-web-app-ready"));
            }
          }}
          onError={(e) => {
            console.error("Failed to load Bale SDK:", e);
          }}
        />

        {/* حذف هرگونه inline script یا style */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
