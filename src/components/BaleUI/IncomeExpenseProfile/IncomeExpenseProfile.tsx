// src\components\BaleUI\IncomeExpenseProfile\IncomeExpenseProfile.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeByMonth: { _id: { year: number; month: number }; amount: number }[];
  expenseByMonth: { _id: { year: number; month: number }; amount: number }[];
}

interface Props {
  buildingId: string;
  onClose: () => void;
}

const fetchSummary = async (buildingId: string): Promise<FinancialSummary> => {
  const res = await fetch(
    `/api/telegram/building/financial-summary?buildingId=${buildingId}`,
  );
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
  const data = await res.json();
  return data.data;
};

export default function IncomeExpenseProfile({ buildingId, onClose }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["financial-summary", buildingId],
    queryFn: () => fetchSummary(buildingId),
    enabled: !!buildingId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 text-center text-red-500">
        خطا در بارگذاری اطلاعات
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    (amount / 10).toLocaleString("fa-IR") + " تومان";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-xl font-bold">📊 نمایه خرج و دخل ساختمان</h2>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* کارت‌های خلاصه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">کل درآمد</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(data.totalIncome)}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">کل هزینه</p>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(data.totalExpense)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">مانده کیف پول</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(data.balance)}
            </p>
          </div>
        </div>

        {/* جدول ساده درآمد و هزینه ماهانه */}
        <div>
          <h3 className="text-lg font-semibold mb-3">جزئیات ماهانه (تومان)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-right">ماه</th>
                  <th className="p-2 text-right">درآمد</th>
                  <th className="p-2 text-right">هزینه</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.incomeByMonth.map((inc) => {
                    const expense = data.expenseByMonth.find(
                      (exp) =>
                        exp._id.year === inc._id.year &&
                        exp._id.month === inc._id.month,
                    );
                    return (
                      <tr
                        key={`${inc._id.year}-${inc._id.month}`}
                        className="border-t"
                      >
                        <td className="p-2">
                          {inc._id.year}/{inc._id.month}
                        </td>
                        <td className="p-2 text-green-600">
                          {(inc.amount / 10).toLocaleString()}
                        </td>
                        <td className="p-2 text-red-600">
                          {expense
                            ? (expense.amount / 10).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
