// src\components\BaleUI\ChargeManager\UserChargeForAdmin.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// --- تایپ‌ها بر اساس اسکیما ---
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
  targetMembers: TargetMember[];
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
  currentTelegramId?: string; // telegramId کاربر جاری
  buildingId: string; // شناسه ساختمان
}

// هوک سفارشی برای دریافت شارژها
const useCharges = (title: string, buildingId: string) => {
  return useQuery<Charge[], Error>({
    queryKey: ["charges", title, buildingId],
    queryFn: async () => {
      const { data } = await axios.get("/api/charges", {
        params: { title, buildingId },
      });
      return data;
    },
    enabled: !!title && !!buildingId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

const usePayCharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chargeId,
      userId,
      buildingId,
    }: {
      chargeId: string;
      userId: string;
      buildingId: string;
    }) => {
      const { data } = await axios.post("/api/charges/pay", {
        chargeId,
        userId,
        buildingId,
      });
      return data;
    },
    onSuccess: () => {
      // بی‌اعتبار کردن کش تمام شارژها
      queryClient.invalidateQueries({ queryKey: ["charges"] });
    },
    onError: (error: Error) => {
      console.error("پرداخت ناموفق:", error);
    },
  });
};

export default function UserChargeListForAdmin({
  currentTelegramId,
  buildingId,
}: ChargeListProps) {
  const [selectedTitle, setSelectedTitle] = useState<string>("charge");

  const {
    data: charges,
    isLoading,
    isError,
    error,
  } = useCharges(selectedTitle, buildingId);
  const payMutation = usePayCharge();

  const handlePay = (chargeId: string, memberTelegramId: string) => {
    if (!currentTelegramId || memberTelegramId !== currentTelegramId) {
      alert("شما مجاز به پرداخت این شارژ نیستید");
      return;
    }

    payMutation.mutate(
      { chargeId, userId: memberTelegramId, buildingId },
      {
        onSuccess: () => alert("پرداخت با موفقیت انجام شد"),
        onError: () => alert("خطا در پرداخت، لطفاً دوباره تلاش کنید"),
      },
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">لیست شارژها</h1>

      {/* انتخاب دسته‌بندی */}
      <div className="mb-6">
        <select
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          {TITLES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* حالت بارگذاری */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

      {/* کارت‌ها */}
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {charges?.map((charge, index) => (
            <motion.div
              key={charge._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* هدر کارت */}
              <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {TITLES.find((t) => t.value === charge.title)?.label}
                    <span className="text-gray-500 mx-2">-</span>
                    {MONTH_NAMES[charge.month] || charge.month} {charge.year}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مبلغ کل: {charge.totalAmount.toLocaleString("fa-IR")} تومان
                  </p>
                  {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                    سهم هر نفر: {charge.amountPerMember.toLocaleString('fa-IR')} تومان
                  </p> */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    سررسید:{" "}
                    {new Date(charge.dueDate).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${
                    charge.isFullyPaid
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {charge.isFullyPaid ? "پرداخت شده" : "در انتظار پرداخت"}
                </span>
              </div>

              {/* لیست اعضای پرداخت‌نکرده */}
              {!charge.isFullyPaid && charge.targetMembers.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-sm font-medium mb-2">اعضای بدهکار:</p>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {charge.targetMembers.map((member) => (
                        <motion.div
                          key={member.telegramId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          <span>
                            {member.firstName} {member.lastName}
                          </span>
                          {member.telegramId === currentTelegramId && (
                            <button
                              onClick={() =>
                                handlePay(charge._id, member.telegramId)
                              }
                              disabled={
                                payMutation.isPending &&
                                payMutation.variables?.chargeId === charge._id
                              }
                              className={`px-3 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                payMutation.isPending &&
                                payMutation.variables?.chargeId === charge._id
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                              }`}
                            >
                              {payMutation.isPending &&
                              payMutation.variables?.chargeId === charge._id
                                ? "در حال پرداخت..."
                                : "پرداخت"}
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* پرداخت کامل */}
              {charge.isFullyPaid && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✅ تمامی اعضا این شارژ را پرداخت کرده‌اند.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
