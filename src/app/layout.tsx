"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import "./globals.css";
import Providers from "./Providers";
import { Toaster } from "react-hot-toast";
import "@/utils/stringExtensions";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [shouldLoadBale, setShouldLoadBale] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isBale = false;
    try {
      // روش 1: بررسی ancestorOrigins (فقط در iframe معتبر است)
      if (
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0
      ) {
        isBale = window.location.ancestorOrigins[0].includes("web.bale.ai");
      }
      // روش 2: اگر در iframe هستیم و روش اول کار نکرد، از referrer استفاده کن
      else if (window.self !== window.top) {
        isBale = document.referrer.includes("web.bale.ai");
      }
      // روش 3: بررسی مستقیم وجود BaleWebApp (در صورت بارگذاری قبلی)
      else if ((window as any).BaleWebApp) {
        isBale = true;
      }
    } catch (err) {
      console.error("Error detecting Bale environment:", err);
    }

    setShouldLoadBale(isBale);
  }, []);
  console.log("rrrrrrrrr");
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Toaster position="top-center" />
        <Providers>{children}</Providers>

        {/* فقط در محیط بله اسکریپت را بارگذاری کن */}
        {shouldLoadBale && (
          <Script
            src="https://tapi.bale.ai/miniapp.js?3"
            strategy="afterInteractive"
            id="bale-sdk"
            onLoad={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("bale-web-app-ready"));
              }
            }}
            onError={(e) => {
              console.error("Failed to load Bale SDK:", e);
            }}
          />
        )}
      </body>
    </html>
  );
}
