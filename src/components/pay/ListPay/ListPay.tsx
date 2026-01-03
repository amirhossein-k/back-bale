// components/pay/ListPay/ListPay.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns-jalali"; // ← جایگزین date-fns
import { CalendarIcon, SearchIcon, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker"; // بعداً می‌سازیم
import { ChargeTypes, getPersianChargeName } from "@/hooks/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface Transaction {
  _id: string;
  userId: number;
  userName: string;
  phoneNumber: string;
  amount: number;
  status: string;
  completedAt: string;
  referenceId: string;
  type: string; // اضافه شد
}

interface ApiResponse {
  transactions: Transaction[];
  totalAmount: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

interface ListPayProps {
  buildingId: string;
  onClose?: () => void; // اضافه شد
}
// جایگزین TYPE_OPTIONS قبلی با استفاده از mapping:
const TYPE_OPTIONS = [
  { value: "all", label: "همه" },
  ...ChargeTypes.map((type) => ({
    value: type,
    label: getPersianChargeName(type) || type,
  })),
];
// تابع fetch با پشتیبانی از cursor (برای useInfiniteQuery)
const fetchPayments = async ({
  buildingId,
  search,
  startDate,
  endDate,
  type,

  cursor,
  limit = 10,
}: {
  buildingId: string;
  search: string;
  startDate?: string;
  endDate?: string;
  type?: string;

  cursor?: string;
  limit?: number;
}): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    buildingId,
    limit: limit.toString(),
    ...(search && { search }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(type && type !== "all" && { type }), // ✅ فقط در صورتی که type != "all" باشد

    ...(cursor && { cursor }),
  });
  const res = await fetch(`/api/transactions/payments?${params}`);
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
  return res.json();
};

export default function ListPay({ buildingId, onClose }: ListPayProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalAmount, setTotalAmount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState("all"); // ✅ مقدار پیش‌فرض "all"

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // تبدیل تاریخ‌ها به string برای API
  const startDateStr = startDate
    ? startDate.toISOString().split("T")[0]
    : undefined;
  const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "payments",
      buildingId,
      debouncedSearch,
      startDateStr,
      endDateStr,
      selectedType,
    ],
    queryFn: ({ pageParam }) =>
      fetchPayments({
        buildingId,
        search: debouncedSearch,
        startDate: startDateStr,
        endDate: endDateStr,
        type: selectedType,

        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!buildingId,
    staleTime: 1 * 60 * 1000,
  });

  // محاسبه مجموع مبلغ از صفحات بارگذاری شده
  useEffect(() => {
    if (data) {
      const total = data.pages.reduce(
        (sum, page) => sum + (page.totalAmount || 0),
        0,
      );
      setTotalAmount(total);
    }
  }, [data]);

  // Intersection Observer برای بارگذاری خودکار
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // همه تراکنش‌ها
  const allTransactions =
    data?.pages.flatMap((page) => page.transactions) || [];
  console.log(allTransactions, "allTransactions");
  console.log(data, "data1");
  // وضعیت بارگذاری اولیه (با Suspense هماهنگ می‌شود)
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 p-4">
        خطا: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-4 text-black my-1 pt-20 relative">
      {/* دکمه بستن در گوشه بالا سمت راست */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-20 text-lg left-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="بستن"
        >
          ✕
        </button>
      )}
      {/* هدر با مجموع مبلغ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          📋 لیست پرداخت‌های شارژ
        </h2>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          مجموع دریافتی: {(totalAmount / 10).toLocaleString("fa-IR")} تومان
        </div>
      </div>

      {/* نوار فیلتر */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* جستجو */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="جستجوی نام یا شماره تماس..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="w-full"
            icon={<SearchIcon className="h-4 w-4" />}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="نوع تراکنش" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* فیلتر تاریخ شروع */}
        <PersianDatePicker
          value={startDate}
          onChange={setStartDate}
          placeholder="از تاریخ"
        />

        {/* فیلتر تاریخ پایان - با PersianDatePicker */}
        <PersianDatePicker
          value={endDate}
          onChange={setEndDate}
          placeholder="تا تاریخ"
        />

        {/* دکمه ریست فیلترها */}
        {(search || startDate || endDate || selectedType) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStartDate(undefined);
              setEndDate(undefined);
              setSelectedType("all"); // ✅ ریست به "all"
            }}
          >
            <X className="h-4 w-4 ml-1" />
            پاک کردن فیلترها
          </Button>
        )}
      </div>

      {/* جدول */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام کاربر</TableHead>
              <TableHead>شماره تماس</TableHead>
              <TableHead>مبلغ (تومان)</TableHead>
              <TableHead>تاریخ پرداخت</TableHead>
              <TableHead>نوع تراکنش</TableHead> {/* تغییر عنوان */}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {allTransactions.map((tx, idx) => (
                <motion.tr
                  key={tx._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                >
                  <TableCell>{tx.userName}</TableCell>
                  <TableCell dir="ltr">{tx.phoneNumber}</TableCell>
                  <TableCell>
                    {(tx.amount / 10).toLocaleString("fa-IR")}
                  </TableCell>
                  <TableCell>
                    {new Date(tx.completedAt).toLocaleDateString("fa-IR")}
                  </TableCell>
                  <TableCell>
                    {getPersianChargeName(tx.type) || tx.type}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* نشانگر بارگذاری بیشتر */}
      {isFetchingNextPage && (
        <div className="py-4 flex justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
      {/* المان دیده‌شونده برای trigger */}
      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
}

// کامپوننت اسکلت لودینگ اولیه
export function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

// کامپوننت انتخابگر تاریخ (با popover)
function DatePicker({
  date,
  setDate,
  placeholder,
}: {
  date?: Date;
  setDate: (d?: Date) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[160px] justify-start text-right font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4 text-black" />
          {date ? format(date, "yyyy/MM/dd") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1d7bd3]" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}
