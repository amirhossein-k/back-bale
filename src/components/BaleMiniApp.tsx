// src/components/BaleMiniApp.tsx
"use client";

import { useEffect, useState } from "react";

// تعریف تایپ برای SDK بله
interface BaleWebApp {
  initData?: string; // رشته کامل initData برای ارسال به بک‌اند
  isIframe: boolean;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  enableClosingConfirmation?: () => void; // اگر SDK از آن پشتیبانی می‌کند

  // متد setBackgroundColor ممکن است وجود نداشته باشد
  // به جای آن از CSS استفاده می‌کنیم
}

declare global {
  interface Window {
    Bale?: {
      WebApp: BaleWebApp;
    };
  }
}

export default function BaleMiniApp() {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isIframe, setIsIframe] = useState<boolean>(false);
  const [isValidated, setIsValidated] = useState(false); // وضعیت اعتبارسنجی
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateAndUseData = async (webApp: BaleWebApp) => {
      try {
        const initData = webApp.initData; // رشته کامل initData
        if (!initData) {
          console.warn("initData is empty");
          return;
        }

        const response = await fetch("/api/telegram/validateminiapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        const data = await response.json();
        if (data.ok) {
          console.log("✅ Data validated, user:", data.user);
          setIsValidated(true);
          // می‌توانید userInfo معتبر را ذخیره کنید
          setUserInfo(data.user);
        } else {
          console.error("❌ Validation failed", data.error);
          setValidationError(data.error || "Invalid data");
          setIsValidated(false);
        }
      } catch (err: any) {
        console.error("❌ Error during validation:", err);
        setValidationError(err.message);
        setIsValidated(false);
      }
    };
    // تابع اصلی برای راه‌اندازی SDK
    const initBaleWebApp = () => {
      const webApp = window.Bale?.WebApp;

      if (!webApp) {
        console.warn("Bale WebApp SDK not found");
        return;
      }

      console.log("Bale WebApp initialized:", webApp);
      const frame = webApp.isIframe;
      if (frame) {
        setIsIframe(frame);
      }
      // دریافت اطلاعات کاربر
      const user = webApp.initDataUnsafe?.user;
      if (user) {
        console.log("User data:", user);
        setUserInfo(user);
      }
      if (webApp.ready) {
        webApp.ready();
      }
      // // فراخوانی ready برای اعلام آمادگی
      // if (typeof webApp.ready === "function") {
      //   webApp.ready();
      // }
      if (webApp.expand) {
        webApp.expand();
      }
      // باز کردن مینی‌اپ به صورت کامل
      // if (typeof webApp.expand === "function") {
      //   webApp.expand();
      // }

      // تغییر رنگ هدر (اگر متد وجود دارد)
      if (typeof webApp.setHeaderColor === "function") {
        webApp.setHeaderColor("#6C47FF");
      }

      // برای تغییر رنگ پس‌زمینه از CSS استفاده می‌کنیم
      document.documentElement.style.setProperty("--bale-bg-color", "#F0F0F0");

      setIsSDKReady(true);

      // فراخوانی اعتبارسنجی
      validateAndUseData(webApp);
    };

    // بررسی وجود SDK
    if (window.Bale?.WebApp) {
      initBaleWebApp();
    } else {
      // منتظر event بارگذاری SDK بمانیم
      const handleSDKReady = () => {
        initBaleWebApp();
        window.removeEventListener("bale-web-app-ready", handleSDKReady);
      };

      window.addEventListener("bale-web-app-ready", handleSDKReady);

      // همچنین یک interval برای بررسی دستی تنظیم می‌کنیم
      const checkInterval = setInterval(() => {
        if (window.Bale?.WebApp) {
          initBaleWebApp();
          clearInterval(checkInterval);
        }
      }, 100);

      // تمیزکاری
      return () => {
        window.removeEventListener("bale-web-app-ready", handleSDKReady);
        clearInterval(checkInterval);
      };
    }
  }, []);
  // در JSX می‌توانید وضعیت‌های مختلف را نمایش دهید
  if (!isSDKReady) return <div>Loading ...</div>;
  if (validationError) return <div>خطا: {validationError}</div>;
  if (!isValidated) return <div>در حال تأیید اطلاعات ...</div>;
  return (
    <div
      className="text-black"
      style={{
        backgroundColor: "var(--bale-bg-color, #ffffff)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>مینی‌اپ بله</h1>

      {isSDKReady ? (
        <div>
          <p>✅ SDK بله با موفقیت بارگذاری شد</p>

          {userInfo && (
            <div
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <h3>اطلاعات کاربر:</h3>
              <p>
                <strong>نام:</strong> {userInfo.first_name}{" "}
                {userInfo.last_name || ""}
              </p>
              <p>
                <strong>آی‌دی:</strong> {userInfo.id}
              </p>
              {userInfo.username && (
                <p>
                  <strong>نام کاربری:</strong> @{userInfo.username}
                </p>
              )}
            </div>
          )}

          {isIframe && (
            <div style={{ marginTop: "30px" }}>
              <button
                onClick={() => {
                  if (window.Bale?.WebApp?.expand) {
                    window.Bale.WebApp.expand();
                  }
                }}
                style={{
                  background: "#6C47FF",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                باز کردن کامل مینی‌اپ
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>⏳ در حال بارگذاری SDK بله...</p>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "#e0e0e0",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: "60%",
                height: "100%",
                background: "#6C47FF",
                animation: "loading 1.5s infinite",
              }}
            ></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
