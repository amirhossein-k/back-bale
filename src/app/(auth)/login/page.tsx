"use client";

import { OtpForm } from "@/components/pay/OtpForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showOtpForm, setShowOtpForm] = useState(false);

  useEffect(() => {
    // 1️⃣ منتظر لودینگ session
    if (status === "loading") return;

    // 2️⃣ کاربر لاگین است و planId دارد → برو به سبد خرید
    if (status === "authenticated" && session?.user) {
      const planId =
        sessionStorage.getItem("selectedPlanId") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("selectedPlanId="))
          ?.split("=")[1];

      if (planId) {
        router.replace("/cart");
        return; // ← redirect می‌کند، فرم OTP نشان داده نمی‌شود
      }
      // اگر planId نداشت، می‌افتد پایین و OTP نشان می‌دهد
    }

    // 3️⃣ لاگین نیست یا لاگین است ولی planId ندارد → OTP Form
    setShowOtpForm(true);
  }, [status, session, router]);

  // 🌀 لودینگ تا تعیین وضعیت نهایی
  if (!showOtpForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  // 📱 فرم OTP
  return <OtpForm />;
}
