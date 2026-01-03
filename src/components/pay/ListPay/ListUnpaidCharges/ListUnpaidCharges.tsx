// components/pay/ListUnpaidCharges/ListUnpaidCharges.tsx
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Bell } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { getPersianChargeName, getPersianMonthName } from "@/hooks/database";

interface UnpaidMember {
  _id: string;
  telegramId: number;
  name: string;
  phoneNumber: string;
}

interface UnpaidCharge {
  chargeId: string;
  title: string;
  month: string;
  year: number;
  totalAmount: number;
  status: string;
  unpaidMembers: UnpaidMember[];
}

const fetchUnpaidCharges = async (
  buildingId: string,
): Promise<UnpaidCharge[]> => {
  const res = await fetch(
    `/api/telegram/unpaid-charges?buildingId=${buildingId}`,
  );
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
  const data = await res.json();
  return data.data;
};

const sendReminder = async (
  chargeId: string,
  userId: string,
  telegramChatId: number,
) => {
  const res = await fetch("/api/telegram/send-reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chargeId, userId, telegramChatId }),
  });
  if (!res.ok) throw new Error("ارسال پیام با خطا مواجه شد");
  return res.json();
};

export default function ListUnpaidCharges({
  buildingId,
  onClose,
}: {
  buildingId: string;
  onClose: () => void;
}) {
  const {
    data: charges,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["unpaidCharges", buildingId],
    queryFn: () => fetchUnpaidCharges(buildingId),
    enabled: !!buildingId,
    staleTime: 2 * 60 * 1000,
  });

  const [sending, setSending] = useState<{ [key: string]: boolean }>({});

  const handleReminder = async (
    chargeId: string,
    userId: string,
    telegramId: number,
  ) => {
    const key = `${chargeId}_${userId}`;
    setSending((prev) => ({ ...prev, [key]: true }));
    try {
      await sendReminder(chargeId, userId, telegramId);
      toast.success("یادآوری با موفقیت ارسال شد");
    } catch (err: any) {
      toast.error(err.message || "خطا در ارسال پیام");
    } finally {
      setSending((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError)
    return (
      <div className="text-red-500 p-4">خطا: {(error as Error).message}</div>
    );
  console.log(charges, "charges");
  if (!charges?.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
        تمام شارژها توسط کاربران پرداخت شده است.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-6 max-h-[80vh] overflow-y-auto relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 text-lg left-4 text-gray-500 hover:text-gray-800 transition-colors z-50"
          aria-label="بستن"
        >
          ✕
        </button>
      )}
      <h2 className="text-xl font-bold text-gray-800 sticky top-0 bg-white py-2 z-10">
        📋 لیست شارژهای پرداخت‌نشده
      </h2>
      {charges.map((charge) => (
        <div
          key={charge.chargeId}
          className="border rounded-lg overflow-hidden"
        >
          <div className="bg-gray-100 px-4 py-2 font-semibold sticky top-12 bg-gray-100 z-5">
            {getPersianChargeName(charge.title) || charge.title} -{" "}
            {getPersianMonthName(charge.month)} {charge.year}
            <span className="mr-4 text-sm font-normal text-gray-600">
              مبلغ کل: {charge.totalAmount.toLocaleString("fa-IR")} تومان
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام کاربر</TableHead>
                  <TableHead>شماره تماس</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {charge.unpaidMembers.map((member) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell>{member.name || "بدون نام"}</TableCell>
                      <TableCell dir="ltr">
                        {member.phoneNumber || "ثبت نشده"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReminder(
                              charge.chargeId,
                              member._id,
                              member.telegramId,
                            )
                          }
                          disabled={sending[`${charge.chargeId}_${member._id}`]}
                        >
                          {sending[`${charge.chargeId}_${member._id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bell className="h-4 w-4 ml-1" />
                          )}
                          ارسال یادآوری
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
