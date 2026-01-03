// components/BaleUI/ExpenseManager/ExpenseManager.tsx
"use client";
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns-jalali";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker";
import { X, Plus, Trash2, Edit, Filter } from "lucide-react";
import { getYear, getMonth } from "date-fns-jalali";
const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const categories = {
  repair: "تعمیرات",
  maintenance: "نگهداری",
  cleaning: "نظافت",
  utilities: "قبوض",
  other: "سایر",
} as const;

type CategoryKey = keyof typeof categories;

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: CategoryKey;
  description?: string;
  date: string;
}

interface ExpenseGroup {
  _id: { year: number; month: number };
  expenses: Expense[];
  totalAmount: number;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliMonthName: string;
}

interface ExpenseManagerProps {
  buildingId: string;
  managerId: string;
  onClose?: () => void; // اضافه شد
}

// انیمیشن‌ها
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ExpenseManager({
  buildingId,
  managerId,
  onClose,
}: ExpenseManagerProps) {
  //   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  //   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // تبدیل تاریخ‌ها به string برای API
  const startDateStr = startDate
    ? startDate.toISOString().split("T")[0]
    : undefined;
  const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

  // دریافت لیست هزینه‌ها
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["expenses", buildingId, startDateStr, endDateStr],
    queryFn: async () => {
      const res = await axios.get(
        `/api/telegram/building/expense?buildingId=${buildingId}&startDateStr=${startDateStr || ""}&endDateStr=${endDateStr || ""}&managerId=${managerId}`,
      );
      return res.data.data as ExpenseGroup[];
    },
    enabled: !!buildingId && !!managerId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // ثبت / ویرایش هزینه
  const mutation = useMutation({
    mutationFn: async (expense: any) => {
      const url = editingExpense
        ? `/api/telegram/building/expense/${editingExpense._id}?managerId=${managerId}`
        : "/api/telegram/building/expense";
      const method = editingExpense ? "put" : "post";
      const res = await axios({
        method,
        url,
        data: { ...expense, buildingId, managerId },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(
        editingExpense ? "هزینه با موفقیت ویرایش شد" : "هزینه با موفقیت ثبت شد",
      );
      setShowForm(false);
      setEditingExpense(null);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || "خطا در ثبت هزینه"),
  });

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این هزینه اطمینان دارید؟")) {
      try {
        await axios.delete(
          `/api/telegram/building/expense/${id}?managerId=${managerId}`,
        );
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        toast.success("هزینه حذف شد");
      } catch {
        toast.error("خطا در حذف هزینه");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      title: formData.get("title"),
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    });
  };

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        خطا در دریافت اطلاعات: {(error as any)?.message}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden relative"
    >
      {/* هدر با دکمه بستن */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-xl font-bold">📊 مدیریت هزینه‌ها</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 text-lg left-4 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="بستن"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* نوار ابزار */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCal(!showCal)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              {showCal ? "بستن فیلتر" : "فیلتر تاریخ"}
            </Button>
            {/* فیلتر تاریخ شروع */}{" "}
          </div>
          {/* دکمه ریست فیلترها */}
          {(startDate || endDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4 ml-1" />
              پاک کردن فیلترها
            </Button>
          )}
          <Button
            onClick={() => {
              setEditingExpense(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="ml-2 h-4 w-4" />{" "}
            {showForm ? "انصراف" : "هزینه جدید"}
          </Button>
        </div>
        <AnimatePresence>
          {showCal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-lg mt-2"
            >
              <PersianDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="از تاریخ"
              />
              <PersianDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="تا تاریخ"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* فرم ثبت/ویرایش با انیمیشن */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-gray-50 p-4 rounded-xl space-y-3 overflow-hidden"
            >
              <Input
                name="title"
                placeholder="عنوان هزینه"
                required
                defaultValue={editingExpense?.title || ""}
              />
              <Input
                name="amount"
                type="number"
                placeholder="مبلغ (تومان)"
                required
                defaultValue={editingExpense?.amount || ""}
              />
              <select
                name="category"
                defaultValue={editingExpense?.category || "other"}
                className="w-full p-2 border rounded"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="توضیحات"
                className="w-full p-2 border rounded"
                defaultValue={editingExpense?.description || ""}
              />
              <PersianDatePicker
                value={
                  editingExpense ? new Date(editingExpense.date) : new Date()
                }
                onChange={(date) => {
                  const input = document.querySelector(
                    'input[name="date"]',
                  ) as HTMLInputElement;
                  if (input && date)
                    input.value = date.toISOString().split("T")[0];
                }}
                placeholder="تاریخ هزینه"
              />
              <input
                type="hidden"
                name="date"
                defaultValue={
                  editingExpense?.date?.split("T")[0] ||
                  new Date().toISOString().split("T")[0]
                }
              />
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending
                  ? "در حال ثبت..."
                  : editingExpense
                    ? "ویرایش هزینه"
                    : "ثبت هزینه"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* نمایش لیست هزینه‌ها */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : data?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            هیچ هزینه‌ای در بازه انتخاب شده ثبت نشده است.
          </p>
        ) : (
          <AnimatePresence>
            {data?.map((group) => {
              // داخل حلقه groups:

              return (
                <motion.div
                  key={`${group._id.year}-${group._id.month}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="border rounded-lg overflow-hidden mb-4"
                >
                  <div className="bg-gray-100 p-3 font-bold flex justify-between">
                    <span>
                      {group.jalaliYear} / {group.jalaliMonthName}
                    </span>

                    <span>
                      مجموع: {group.totalAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>عنوان</TableHead>
                          <TableHead>نوع</TableHead>
                          <TableHead>مبلغ (تومان)</TableHead>
                          <TableHead>تاریخ</TableHead>
                          <TableHead>عملیات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.expenses.map((exp) => (
                          <motion.tr key={exp._id} variants={itemVariants}>
                            <TableCell>{exp.title}</TableCell>
                            <TableCell>{categories[exp.category]}</TableCell>
                            <TableCell>
                              {exp.amount.toLocaleString("fa-IR")}
                            </TableCell>
                            <TableCell>
                              {format(new Date(exp.date), "yyyy/MM/dd")}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingExpense(exp);
                                    setShowForm(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(exp._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
