"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
// import { FaArrowRight, FaSpinner } from 'react-icons';
import type {
  Plan,
  Purchase,
  PaymentRequestResponse,
  ApiResponse,
  CreatePurchaseInput,
} from "@/types/pay";

// --- مرحله‌ای: ایجاد خرید + درخواست لینک پرداخت ---
interface PurchaseFlowResult {
  purchase: Purchase;
  paymentUrl: string;
  transId: string;
}

const executePurchaseFlow = async (
  input: CreatePurchaseInput & { amount: number },
): Promise<PurchaseFlowResult> => {
  // مرحله ۱: ایجاد خرید در دیتابیس
  const purchaseRes = await axios.post<ApiResponse<Purchase>>(
    "/api/purchases",
    {
      planId: input.planId,
      phoneNumber: input.phoneNumber,
    },
  );
  const purchaseData = purchaseRes.data;
  if (!purchaseData.success || !purchaseData.data) {
    throw new Error(purchaseData.message || "خطا در ایجاد خرید");
  }
  const purchase = purchaseData.data;

  // مرحله ۲: درخواست لینک پرداخت
  const paymentRes = await axios.post<ApiResponse<PaymentRequestResponse>>(
    "/api/payment/request",
    {
      purchaseId: purchase.purchaseId,
      amount: input.amount,
      phoneNumber: input.phoneNumber,
    },
  );
  const paymentData = paymentRes.data;
  if (!paymentData.success || !paymentData.data) {
    throw new Error(paymentData.message || "خطا در اتصال به درگاه پرداخت");
  }

  return {
    purchase,
    paymentUrl: paymentData.data.paymentUrl,
    transId: paymentData.data.transId,
  };
};

// =============================================

export default function ConfirmPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");

  // بازیابی پلن انتخاب‌شده از sessionStorage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (!storedPlan) {
      router.replace("/");
      return;
    }
    try {
      setPlan(JSON.parse(storedPlan) as Plan);
    } catch {
      router.replace("/");
    }
  }, [router]);

  // --- ایجاد خرید و درخواست پرداخت ---
  const purchaseMutation = useMutation<
    PurchaseFlowResult,
    Error,
    CreatePurchaseInput
  >({
    mutationFn: (data) =>
      executePurchaseFlow({
        ...data,
        amount: plan?.price ?? 0,
      }),
    onSuccess: (result) => {
      // ذخیره اطلاعات در sessionStorage برای صفحه callback
      sessionStorage.setItem(
        "currentPurchase",
        JSON.stringify(result.purchase),
      );
      sessionStorage.setItem("transId", result.transId);

      // هدایت به درگاه پرداخت
      window.location.href = result.paymentUrl;
    },
    onError: (err) => {
      const axiosError = err as AxiosError<ApiResponse>;
      setError(
        axiosError.response?.data?.message ||
          err.message ||
          "خطا در ایجاد خرید",
      );
    },
  });

  // --- ارسال فرم ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");

    const trimmed = phoneNumber.trim();

    if (!trimmed) {
      setError("لطفاً شماره تلفن خود را وارد کنید");
      return;
    }

    if (!/^09\d{9}$/.test(trimmed)) {
      setError("شماره تلفن معتبر نیست (مثال: 09123456789)");
      return;
    }

    if (!plan) {
      setError("پلن انتخاب‌شده یافت نشد. لطفاً دوباره تلاش کنید.");
      return;
    }

    purchaseMutation.mutate({
      planId: plan._id,
      phoneNumber: trimmed,
    });
  };

  // --- نمایش لودینگ تا زمانی که پلن لود بشه ---
  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // =============================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {/* دکمه بازگشت */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            {/* <FaArrowRight /> */}
            <span>بازگشت به صفحه اصلی</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            تأیید و پرداخت
          </h1>

          {/* نمایش پلن */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <h3 className="font-semibold text-gray-800">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                مدت اعتبار: {plan.duration} روز
              </span>
              <span className="text-xl font-bold text-blue-600">
                {plan.price.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>

          {/* فرم شماره تلفن */}
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              شماره تلفن عضو شده در بله
            </label>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              placeholder="09123456789"
              value={phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhoneNumber(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center
                         text-lg font-mono"
              maxLength={11}
              autoComplete="tel"
            />
            <p className="text-xs text-gray-400 mt-1">
              شماره‌ای که در پیام‌رسان بله با آن عضو هستید
            </p>

            {/* خطا */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-3"
                role="alert"
              >
                ❌ {error}
              </motion.p>
            )}

            {/* دکمه پرداخت */}
            <motion.button
              type="submit"
              disabled={purchaseMutation.isPending}
              whileHover={!purchaseMutation.isPending ? { scale: 1.03 } : {}}
              whileTap={!purchaseMutation.isPending ? { scale: 0.97 } : {}}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                         py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl 
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchaseMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  {/* <FaSpinner className="animate-spin" /> */}
                  در حال اتصال به درگاه پرداخت...
                </span>
              ) : (
                `پرداخت ${plan.price.toLocaleString("fa-IR")} تومان`
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
