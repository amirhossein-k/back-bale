// src/components/BaleUI/ChargeManager/UserCharge.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { UserModelType } from "@/types/user";

// --- تایپ‌ها ---
interface TargetMember {
  telegramId: string;
  firstName: string;
  lastName: string;
}

interface Charge {
  _id: string;
  buildingId: string;
  title: string;
  month: string;
  year: number;
  totalAmount: number;
  dueDate: string;
  status: "pending" | "partial" | "completed";
  targetMember: string[];
  isFullyPaid: boolean;
}

const TITLES = [
  { value: "charge", label: "شارژ ساختمان" },
  { value: "electricity", label: "برق" },
  { value: "water", label: "آب" },
  { value: "Facilities", label: "امکانات" },
  { value: "extra", label: "متفرقه" },
] as const;

const MONTH_NAMES: Record<string, string> = {
  far: "فروردین",
  ordi: "اردیبهشت",
  khor: "خرداد",
  tir: "تیر",
  mor: "مرداد",
  shahr: "شهریور",
  mehr: "مهر",
  aban: "آبان",
  azar: "آذر",
  dey: "دی",
  bahman: "بهمن",
  esfand: "اسفند",
};

interface ChargeListProps {
  userId: number;
  buildingId: string;
  user: Partial<UserModelType>;
  onClose?: () => void; // برای بستن مودال از والد
}

// --- هوک سفارشی برای دریافت شارژها ---
const useCharges = (title: string, buildingId: string) => {
  return useQuery<Charge[], Error>({
    queryKey: ["charges", title, buildingId],
    queryFn: async () => {
      const { data } = await axios.get("/api/telegram/charges", {
        params: { title, buildingId },
      });
      return data.data;
    },
    enabled: !!title && !!buildingId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// --- هوک پرداخت ---
const usePayCharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      phoneNumber: string;
      userId: any;
      title: string;
      description: string;
      totalAmount: number;
      chargeId: any;
    }) => {
      const res = await fetch("/api/payment/requestcharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoenNumber: payload.phoneNumber, // API از این فیلد استفاده می‌کند
          userId: payload.userId,
          title: payload.title,
          description: payload.description,
          totalAmount: payload.totalAmount,
          chargeId: payload.chargeId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "خطا در ارتباط با سرور");
      }

      const result = await res.json();
      if (!result.redirectUrl) {
        throw new Error(result.error || "لینک پرداخت دریافت نشد");
      }
      return result;
    },
    onSuccess: (data) => {
      // باز کردن لینک پرداخت در WebView بله
      console.log(data, "data req zarin");
      if (
        typeof window !== "undefined" &&
        (window as any).Bale?.WebApp?.openLink
      ) {
        (window as any).Bale.WebApp.openLink(data.redirectUrl, {
          try_instant_view: true,
        });
      } else {
        window.location.href = data.redirectUrl;
      }
      // پس از بازگشت از پرداخت، کش را نامعتبر می‌کنیم (درصورتی که پیام موفقیت از طریق postMessage بیاید)
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در پرداخت");
    },
  });
};

export default function ChargeList({
  userId,
  buildingId,
  user,
  onClose,
}: ChargeListProps) {
  const [selectedTitle, setSelectedTitle] = useState<string>("charge");
  const [refetchKey, setRefetchKey] = useState(0);

  const {
    data: charges,
    isLoading,
    isError,
    error,
    refetch,
  } = useCharges(selectedTitle, buildingId);

  const payMutation = usePayCharge();

  // گوش دادن به پیام موفقیت پرداخت (از تب پرداخت)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === "payment_success") {
        toast.success("پرداخت با موفقیت انجام شد");
        refetch(); // به‌روزرسانی لیست
        // در صورت تمایل مودال را ببندید
        // onClose?.();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refetch, onClose]);

  const handlePay = useCallback(
    (charge: Charge) => {
      if (!userId || !buildingId) {
        toast.error("اطلاعات کاربر یا ساختمان یافت نشد");
        return;
      }
      if (!user?.phoneNumber) {
        toast.error(
          "شماره تماس شما ثبت نشده است. لطفاً ابتدا شماره خود را ثبت کنید.",
        );
        return;
      }
      const description = `پرداخت ${TITLES.find((t) => t.value === charge.title)?.label} - ${MONTH_NAMES[charge.month] || charge.month} ${charge.year}`;
      payMutation.mutate({
        phoneNumber: user.phoneNumber,
        userId: user._id,
        title: charge.title,
        description,
        totalAmount: charge.totalAmount,
        chargeId: charge._id,
      });
    },
    [userId, buildingId, user, payMutation],
  );

  const handleRefresh = () => {
    refetch();
    toast.success("لیست به‌روزرسانی شد");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h2 className="text-xl font-bold text-white">💳 شارژ ماهیانه</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* محتوا */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* انتخاب دسته‌بندی و دکمه رفرش */}
          <div className="flex gap-3 mb-6">
            <select
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {TITLES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition"
              title="به‌روزرسانی"
            >
              🔄
            </button>
          </div>

          {/* حالت بارگذاری */}
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* خطا */}
          {isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
              خطا در دریافت اطلاعات: {error?.message || "خطای ناشناخته"}
            </div>
          )}

          {/* خالی */}
          {!isLoading && charges?.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              هیچ شارژی برای این دسته‌بندی یافت نشد.
            </p>
          )}

          {/* لیست کارت‌ها */}
          <AnimatePresence mode="popLayout">
            {charges?.map((charge, index) => (
              <motion.div
                key={charge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4 shadow-sm border border-gray-200 dark:border-gray-600 relative"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold">
                      {TITLES.find((t) => t.value === charge.title)?.label}
                      <span className="text-gray-500 mx-2">-</span>
                      {MONTH_NAMES[charge.month] || charge.month} {charge.year}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      مبلغ: {charge.totalAmount.toLocaleString("fa-IR")} تومان
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      سررسید:{" "}
                      {new Date(charge.dueDate).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${
                      charge.status !== "pending"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {charge.status !== "pending"
                      ? "پرداخت شده"
                      : "در انتظار پرداخت"}
                  </span>
                </div>

                {/* دکمه پرداخت (فقط برای کاربرانی که در targetMember هستند و پرداخت نکرده‌اند) */}
                {charge.status !== "completed" &&
                  userId &&
                  (charge.targetMember ?? []).includes(userId.toString()) && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handlePay(charge)}
                        disabled={payMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50"
                      >
                        {payMutation.isPending &&
                        payMutation.variables?.chargeId === charge._id
                          ? "در حال اتصال..."
                          : "پرداخت"}
                      </button>
                    </div>
                  )}

                {/* پیام پرداخت کامل */}
                {charge.isFullyPaid && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ تمامی اعضا این شارژ را پرداخت کرده‌اند.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* فوتر */}
        <div className="border-t dark:border-gray-700 p-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            بستن
          </button>
        </div>
      </motion.div>
    </div>
  );
}
