// components/DashboardAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import InviteLinkManager from "@/components/InviteLinkManager";
import MemberForAdmin from "@/components/BaleUI/memebersForAdmin/MemberForAdmin";
import SendToGroupForm from "@/components/BaleUI/SendToGroupForm/SendToGroupForm";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import toast from "react-hot-toast";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { UserCharge } from "@/components/BaleUI/ChargeManager/UserCharge";

const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
const TOKEN2 = "WALLET-TEST-1111111111111111";

export default function DashboardUser() {
  const { buildingId, userId } = useSelector(
    (state: RootState) => state.dataBale,
  );
  const [openListUser, setOpenListUser] = useState(false);
  const [openCharge, setOpenCharge] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleToggleCharge = useCallback((state: boolean) => {
    setOpenCharge(state);
  }, []);
  console.log(window.Bale, "ffffff");

  const handleSend = async () => {
    const toastId = toast.loading("در حال انجام  ...");

    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TOKEN }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(`error: ${data.error}`, { id: toastId });
        console.error("Failed to create invoice:", data.error);
        return;
      }
      toast.success("اقدام به پرداخت کنید", { id: toastId });
      const toastId2 = toast.loading("در حال انجام  ...");

      // 2️⃣ باز کردن صفحه پرداخت با openInvoice (SDK)
      window.Bale?.WebApp?.openInvoice(data.invoiceLink, (status: any) => {
        console.log("object", status);
        setPaymentStatus(status);
        // toast.success(``, { id: toastId });

        // toast.success(`status: ${typeof status} - ${status.invoiceClosed}`);
        // status می‌تواند: "paid" | "cancelled" | "failed" | "pending"
        switch (status.status) {
          case "paid":
            toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
          case "cancelled":
            toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
          case "failed":
            toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
              id: toastId2,
            });
          case "pending":
            if (status.status === "failed") {
              toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
                id: toastId2,
              });
            } else if (status.status === "cancelled") {
              toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
            } else if (status.status === "failed") {
              toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
                id: toastId2,
              });
            } else {
              toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
            }
        }
      });
      // if (window.Bale?.WebApp?.onEvent()) {
      //   toast.error("exit");
      // }
    } catch (error: any) {
      console.log(error, "errorr");
      toast.error(`خطا در پرداخت : ${error.message || "خطای نامشخص"}`, {
        id: toastId,
      });
    }
  };
  const handleSendTest = async () => {
    const toastId = toast.loading("در حال انجام  ...");

    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TOKEN: TOKEN2 }),
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Failed to create invoice:", data.error);
        return;
      }
      toast.success("اقدام به پرداخت کنید", { id: toastId });
      const toastId2 = toast.loading("در حال انجام  ...");

      // 2️⃣ باز کردن صفحه پرداخت با openInvoice (SDK)
      window.Bale?.WebApp?.openInvoice(data.invoiceLink, (status: any) => {
        console.log("object", status);
        setPaymentStatus(status);
        // toast.success(``, { id: toastId });

        // toast.success(`status: ${typeof status} - ${status.invoiceClosed}`);
        // status می‌تواند: "paid" | "cancelled" | "failed" | "pending"
        switch (status.status) {
          case "paid":
            toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
          case "cancelled":
            toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
          case "failed":
            toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
              id: toastId2,
            });
          case "pending":
            if (status.status === "failed") {
              toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
                id: toastId2,
              });
            } else if (status.status === "cancelled") {
              toast.error(`صفحه پرداخت بسته شد`, { id: toastId2 });
            } else if (status.status === "failed") {
              toast.error(`❌دوباره تلاش کنید پرداخت صورت نگرفت`, {
                id: toastId2,
              });
            } else {
              toast.success("✅ پرداخت با موفقیت انجام شد!", { id: toastId2 });
            }
        }
        // console.log(window.Bale?.WebApp?.onEvent(),'event')
      });
      // if (window.Bale?.WebApp?.invoiceClosed) {
      //   toast.error("exit");
      // }
    } catch (error: any) {
      console.log(error, "errorr");
      toast.error(`خطا در پرداخت : ${error.message || "خطای نامشخص"}`, {
        id: toastId,
      });
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="w-full"
    >
      {/* دکمه راهنما */}
      <FloatingHelpButton />
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-linear-to-l from-indigo-600 to-purple-600 px-5 py-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <motion.span
            className="inline-block text-2xl"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🏢
          </motion.span>
          <div>
            <h2 className="text-lg font-bold">پنل مدیریت</h2>
            <p className="text-xs text-white/70">مدیریت ساختمان شما</p>
          </div>
        </div>
      </div>

      {/* ── محتوای داشبورد ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl gap-1.5 flex flex-col bg-white p-5 shadow-sm ring-1 ring-gray-100 bg-linear-to-l from-indigo-600 to-purple-600 px-5 py-4 text-white "
        >
          {/* ──شارژ ماهیانه  ──────────────────────────── */}

          <motion.button
            onClick={() => handleToggleCharge(!openCharge)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              animate={{ rotate: openCharge ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            {openCharge ? "بستن" : "شارژ ماهیانه"}
          </motion.button>
        </motion.div>
      </AnimatePresence>
      {/* ── شارژ ماهیانه────────────────────────────── */}
      <AnimatePresence>
        {openCharge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleCharge(false)}
          >
            <motion.div
              key="gapmessage-modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-md"
            >
              <UserCharge
                buildingId={buildingId}
                userId={userId}
                // onClose={() => handleToggleListUser(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
