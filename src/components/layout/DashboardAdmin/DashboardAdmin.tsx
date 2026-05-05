// components/DashboardAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import InviteLinkManager from "@/components/InviteLinkManager";
import MemberForAdmin from "@/components/BaleUI/memebersForAdmin/MemberForAdmin";
import SendToGroupForm from "@/components/BaleUI/SendToGroupForm/SendToGroupForm";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import { useBaleWebApp } from "@/hooks/useBaleWebApp";

interface Props {
  buildingId: any;
  userId: any;
}

type URLSearch = {
  sort?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
  count?: string;
  offer?: string;
};

export default function DashboardAdmin({ buildingId, userId }: Props) {
  const [openLink, setOpenLink] = useState(false);
  const [openListUser, setOpenListUser] = useState(false);
  const [openGapMessage, setOpenGapMessage] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleToggleLink = useCallback((state: boolean) => {
    setOpenLink(state);
  }, []);
  const handleToggleListUser = useCallback((state: boolean) => {
    setOpenListUser(state);
  }, []);
  const handleToggleGapMessage = useCallback((state: boolean) => {
    setOpenGapMessage(state);
  }, []);
  console.log(window.Bale, "ffffff");

  const API_URL = `https://tapi.bale.ai/bot1141850488:chb9KioVVst6Z_LuWLRKW_aZ2RaiPyjEYJ4/sendInvoice`;
  const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
  const handleSend = async () => {
    try {
      const res = await fetch("/api/telegram/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Failed to create invoice:", data.error);
        return;
      }

      // 2️⃣ باز کردن صفحه پرداخت با openInvoice (SDK)
      window.Bale?.WebApp?.openInvoice(data.invoiceLink, (status: string) => {
        console.log("object");
        setPaymentStatus(status);
        // status می‌تواند: "paid" | "cancelled" | "failed" | "pending"
        if (status === "paid") {
          // پرداخت موفق - اقدامات بعدی
          console.log("✅ پرداخت با موفقیت انجام شد!");
        } else if (status === "cancelled") {
          console.log("❌ کاربر پرداخت را لغو کرد");
        }
      });

      // openInvoice({ invoiceParams: data.invoiceLink }, (status: string) => {
      //   console.log("object");
      //   setPaymentStatus(status);
      //   // status می‌تواند: "paid" | "cancelled" | "failed" | "pending"
      //   if (status === "paid") {
      //     // پرداخت موفق - اقدامات بعدی
      //     console.log("✅ پرداخت با موفقیت انجام شد!");
      //   } else if (status === "cancelled") {
      //     console.log("❌ کاربر پرداخت را لغو کرد");
      //   }
      // });
    } catch (error) {
      console.log(error, "errorr");
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

        {/* ── دکمه لینک دعوت ──────────────────────────── */}
        <motion.button
          onClick={() => handleToggleLink(!openLink)}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <motion.span
            animate={{ rotate: openLink ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block text-lg"
          >
            🔗
          </motion.span>
          {openLink ? "بستن" : "لینک دعوت"}
        </motion.button>
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
          {/* ── دکمه لیست کاربران  ──────────────────────────── */}

          <motion.button
            onClick={() => handleToggleListUser(!openListUser)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              animate={{ rotate: openListUser ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            {openListUser ? "بستن" : "لیست کاربران"}
          </motion.button>
          <button className="p-3" onClick={handleSend}>
            پرداخت
          </button>
          {/* ── دکمه پیام در گروه   ──────────────────────────── */}

          <motion.button
            onClick={() => handleToggleGapMessage(!openGapMessage)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              animate={{ rotate: openGapMessage ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            {openGapMessage ? "بستن" : "پیام در گروه"}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* ── مودال لینک دعوت ────────────────────────────── */}
      <AnimatePresence>
        {openLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleLink(false)}
          >
            <motion.div
              key="invite-modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-md"
            >
              <InviteLinkManager
                buildingId={buildingId}
                userId={userId}
                onClose={() => handleToggleLink(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── مودال  لیست کاربران ────────────────────────────── */}
      <AnimatePresence>
        {openListUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleListUser(false)}
          >
            <motion.div
              key="listuser-modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-md"
            >
              <MemberForAdmin
                buildingId={buildingId}
                currentUserId={userId}
                // onClose={() => handleToggleListUser(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── مودال  پیام در گروه  ────────────────────────────── */}
      <AnimatePresence>
        {openGapMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleGapMessage(false)}
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
              <SendToGroupForm
                buildingId={buildingId}
                userId={userId}
                // onClose={() => handleToggleListUser(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ──  ────────────────────────────── */}
      <AnimatePresence>
        {openGapMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleGapMessage(false)}
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
              <SendToGroupForm
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
