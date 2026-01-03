// src\components\BaleUI\Modir\WalletManager\WalletManager.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { bildingType } from "@/store/Slice/BaleDateSlice";
import { walletsType } from "@/types/wallets";
import mongoose from "mongoose";

// --- تایپ‌ها بر اساس اسکیما ---
interface TargetMember {
  telegramId: string;
  firstName: string;
  lastName: string;
}

interface Wallet {
  wallets: walletsType[];
  listManagerId: mongoose.Schema.Types.ObjectId[];
}

const TITLES = [
  { value: "pending", label: "پرداخت نشده" },
  { value: "completed", label: "پرداخت شده" },
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

// هوک سفارشی برای دریافت کیف پول ها
const useWallets = (title: string, bildingsId: bildingType[]) => {
  return useQuery<Wallet, Error>({
    queryKey: ["wallets", title, bildingsId],
    queryFn: async () => {
      const { data } = await axios.post("/api/telegram/wallets", {
        title,
        bildingsId,
      });
      console.log(data, "data");
      return data.data;
    },
    enabled: !!title && !!bildingsId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
const TOKEN2 = "WALLET-TEST-1111111111111111";

// const usePayCharge = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       chatId,
//       title,
//       description,
//       totalAmount,
//       month,
//       year,
//       chargeId,
//     }: {
//       title: string;
//       chatId: number;
//       description: string;
//       totalAmount: number;
//       month: string;
//       year: number;
//       chargeId: any;
//     }) => {
//       const res = await fetch("/api/telegram/invoice", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           TOKEN2,
//           chatId,
//           title,
//           description,
//           totalAmount,
//           month,
//           year,
//           chargeId,
//         }),
//       });
//       const toastId2 = toast.loading("در حال انجام  ...");

//       if (!res.ok) {
//         const errData = await res.json().catch(() => null);
//         throw new Error(errData?.error || "خطا در پرداخت");
//       }

//       const data = await res.json();
//       console.log(data, "dataa");
//       if (!data.success) {
//         throw new Error(data.error || "پرداخت ناموفق");
//       }
//       window.Bale?.WebApp?.openInvoice(data.invoiceLink, (status: any) => {
//         console.log("objeckkt", status);
//         // setPaymentStatus(status);
//         // toast.success(``, { id: toastId });

//         // toast.success(`status: ${typeof status} - ${status.invoiceClosed}`);
//         // status می‌تواند: "paid" | "cancelled" | "failed" | "pending"
//         switch (status.status) {
//           case "paid":
//             // queryClient.invalidateQueries({ queryKey: ["charges"] });

//             toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
//           case "cancelled":
//             toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
//           case "failed":
//             toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
//               id: toastId2,
//             });
//           case "pending":
//             if (status.status === "failed") {
//               toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
//                 id: toastId2,
//               });
//             } else if (status.status === "cancelled") {
//               toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
//             } else if (status.status === "failed") {
//               toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
//                 id: toastId2,
//               });
//             } else {
//               queryClient.invalidateQueries({ queryKey: ["charges"] });

//               toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
//             }
//         }
//       });
//       return data;
//     },
//     onSuccess: (data) => {
//       // بی‌اعتبار کردن کش تمام شارژها
//       queryClient.invalidateQueries({ queryKey: ["charges"] });
//       toast.success(`data: ${data.message}`);
//     },
//     onError: (error: Error) => {
//       console.error("پرداخت ناموفق:", error);
//       toast.error(error.message || "خطا در پرداخت");
//     },
//   });
// };

export default function WalletManager({
  bildingsId,
  userId,
}: {
  userId: number;
  bildingsId: bildingType[];
}) {
  const [selectedTitle, setSelectedTitle] = useState<string>("charge");
  // const { buildingId, userId: currentTelegramId } = useSelector(
  //   (state: RootState) => state.dataBale,
  // );
  const {
    data: wallets,
    isLoading,
    isError,
    error,
  } = useWallets(selectedTitle, bildingsId);

  // const payMutation = usePayCharge();
  // const handlePay = (
  //   title: string,
  //   chatId: number,
  //   description: string,
  //   totalAmount: number,
  //   month: string,
  //   year: number,
  //   chargeId: any,
  // ) => {
  //   if (!userId || chatId !== userId) {
  //     alert("شما مجاز به پرداخت این شارژ نیستید");
  //     return;
  //   }
  //   if (bildingsId.length < 0) {
  //     toast.error("اطلاعات ساختمان یافت نشد");
  //     return;
  //   }

  //   payMutation.mutate(
  //     { chatId, description, month, title, totalAmount, year, chargeId },
  //     {
  //       onSuccess: () => alert("پرداخت با موفقیت انجام شد"),
  //       onError: () => alert("خطا در پرداخت، لطفاً دوباره تلاش کنید"),
  //     },
  //   );
  // };

  console.log(wallets, "wallets");
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
      {!isLoading && wallets?.wallets?.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          هیچ کیف پولی برای این دسته‌بندی یافت نشد.
        </p>
      )}

      {/* کارت‌ها */}
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {wallets?.wallets?.map((wallet, index) => (
            <motion.div
              key={String(wallet._id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              className="bg-white relative dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {wallet.status !== "completed" && (
                <button
                  // onClick={
                  // () => handlePay()
                  //    wallet.title,
                  //    userId,
                  //    `پرداخت`,
                  //    wallet.totalAmount,
                  //    wallet.month,
                  //    wallet.year,
                  //    wallet._id,
                  // }
                  className="bg-[#009bf0] absolute bottom-4 py-2 px-9 left-4 rounded-md"
                >
                  پرداخت
                </button>
              )}

              {/* هدر کارت */}
              <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {TITLES.find((t) => t.value === wallet.status)?.label}
                    <span className="text-gray-500 mx-2">-</span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    مبلغ کل: {wallet.balance.toLocaleString("fa-IR")} تومان
                  </p>
                  {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                    سهم هر نفر: {charge.amountPerMember.toLocaleString('fa-IR')} تومان
                  </p> */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تاریخ اخرین شارژ کیف پول
                    {new Date(wallet.updatedAt).toLocaleDateString("fa-IR")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    کل مبلغ واریز شده تا الان
                    {wallet.totalWithdrawn}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${
                    wallet.status !== "pending"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {wallet.status !== "pending"
                    ? "پرداخت شده"
                    : "در انتظار پرداخت"}
                </span>
              </div>

              {/* پرداخت کامل */}
              {wallet.status === "completed" && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✅ پرداخت شده است
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
