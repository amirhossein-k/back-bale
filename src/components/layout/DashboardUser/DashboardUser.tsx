// components/DashboardAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback } from "react";
import InviteLinkManager from "@/components/InviteLinkManager";
import MemberForAdmin from "@/components/BaleUI/memebersForAdmin/MemberForAdmin";
import SendToGroupForm from "@/components/BaleUI/SendToGroupForm/SendToGroupForm";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import toast from "react-hot-toast";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import ChargeList from "@/components/BaleUI/ChargeManager/UserCharge";
import { UserModelType } from "@/types/user";
import Modal from "@/components/ui/Modal";
import { UpdateUserPhone } from "@/store/Slice/BaleDateSlice";

const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
const TOKEN2 = "WALLET-TEST-1111111111111111";

export default function DashboardUser() {
  const { buildingId, userId, user } = useSelector(
    (state: RootState) => state.dataBale,
  );
  const dispatch = useDispatch();
  const [openListUser, setOpenListUser] = useState(false);
  const [openCharge, setOpenCharge] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [showNoPhoneModal, setShowNoPhoneModal] = useState(!user.phoneNumber);
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      toast.error("لطفاً شماره تماس را وارد کنید");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/telegram/user/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user.telegramId,
          phoneNumber: phoneInput,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "خطا در ثبت شماره");
      } else {
        toast.success("شماره تماس با موفقیت ثبت شد");
        setShowNoPhoneModal(false);
        dispatch(UpdateUserPhone({ phoneInput }));
      }
    } catch (error: any) {
      toast.error(error.message || "خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };
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
  const handleToggleListUser = useCallback((state: boolean) => {
    setOpenListUser(state);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="w-full"
    >
      <Modal
        isOpen={showNoPhoneModal}
        onClose={() => setShowNoPhoneModal(false)}
        title="⚠️ ثبت شماره تماس"
        size="lg"
        closeOnOutsideClick={false}
      >
        <div className="text-center">
          {/* آیکون هشدار متحرک */}
          <motion.div
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            برای بهرهمندی بهتر از اعلانات ساختمان لطفا شماره موبایلی که در بله
            هستید را وارد کنید
          </h3>

          {/* ثبت شماره تماس */}
          <form
            onSubmit={handleSubmitPhone}
            className="bg-gray-50 rounded-xl p-4 text-right mb-6"
          >
            <input
              type="tel"
              dir="ltr"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="09123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                "ثبت شماره تماس"
              )}
            </button>
          </form>

          {/* دکمه‌ها */}
          {/* <div className="flex gap-3 justify-center">
            <motion.button
              onClick={() => {
                window.Bale?.WebApp?.close();
                setShowNoPhoneModal(false);
              }}
              className="px-6 py-2.5 bg-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              بعداً
            </motion.button>
          </div> */}
        </div>
      </Modal>
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
              <ChargeList
                buildingId={buildingId}
                userId={userId}
                user={user}
                onClose={() => handleToggleCharge(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* بخش بعدی */}
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className=" rounded-2xl gap-2 flex flex-row bg-white p-3 shadow-sm ring-1 ring-gray-100  bg-linear-to-l from-[#424ebb] to-[#42bcc5] text-white"
        >
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
    </motion.div>
  );
}
