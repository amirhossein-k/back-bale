// src/components/OtpForm.tsx
"use client";
import { useEffect, useState } from "react";
import { useOtp } from "@/hooks/useOtp";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAccessCartPlan } from "@/store/Slice/planeSlice";

export function OtpForm() {
  const {
    step,
    loading,
    error,
    remainingSeconds,
    remainingAttempts,
    sendOtp,
    verifyOtp,
    reset,
  } = useOtp();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const dispatch = useDispatch();
  const router = useRouter();
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(phone);
  };
  const { data: session } = useSession();
  const user = session?.user;
  console.log(user, "usehhr");

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    const success = await verifyOtp(fullCode);

    if (success) {
      // خواندن planId از sessionStorage یا کوکی
      let planId = sessionStorage.getItem("selectedPlanId");
      if (!planId) {
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("selectedPlanId="));
        planId = cookie ? cookie.split("=")[1] : null;
      }
      if (planId) {
        sessionStorage.setItem("selectedPlanId", planId);
        console.log(user, "usehhr");
        dispatch(setAccessCartPlan(true));
        // ✅ صبر کنید تا کوکی session در مرورگر ذخیره شود
        // await new Promise((resolve) => setTimeout(resolve, 5000));
        router.push("/cart");

        // window.location.href = "/cart";
      } else {
        router.replace("/");
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    // حرکت خودکار به فیلد بعدی
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className=" min-h-full h-screen max-w-sm flex justify-center items-center mx-auto p-6 text-black bg-white rounded-2xl shadow-lg">
      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.form
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSendOtp}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-center">ورود / ثبت‌نام</h2>
            <p className="text-sm text-gray-500 text-center">
              شماره موبایل خود را وارد کنید
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-mono"
              maxLength={11}
              required
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || phone.length < 11}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
            </button>
          </motion.form>
        )}

        {step === "otp" && (
          <motion.form
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleVerifyOtp}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-center">کد تأیید</h2>
            <p className="text-sm text-gray-500 text-center">
              کد ۶ رقمی ارسال شده به {phone} را وارد کنید
            </p>
            <div className="flex gap-2 justify-center" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {remainingAttempts < 5 && (
              <p className="text-orange-500 text-sm text-center">
                {remainingAttempts} تلاش باقی مانده
              </p>
            )}
            <button
              type="submit"
              disabled={loading || code.join("").length < 6}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "در حال بررسی..." : "تأیید کد"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              تغییر شماره موبایل
            </button>
          </motion.form>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-bold text-green-600">
              احراز هویت موفق
            </h2>
            <p className="text-gray-500">شماره {phone} تأیید شد</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
