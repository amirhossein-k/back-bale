// components/DashboardAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, Suspense } from "react";
import InviteLinkManager from "@/components/InviteLinkManager";
import MemberForAdmin from "@/components/BaleUI/memebersForAdmin/MemberForAdmin";
import SendToGroupForm from "@/components/BaleUI/SendToGroupForm/SendToGroupForm";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import RegisterDropdown from "@/components/BaleUI/ChargeManager/RegisterDropdown";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import ListPay, { LoadingSkeleton } from "@/components/pay/ListPay/ListPay";
import ListUnpaidCharges from "@/components/pay/ListPay/ListUnpaidCharges/ListUnpaidCharges";
import ExpenseManager from "@/components/BaleUI/ExpenseManager/ExpenseManager";
import IncomeExpenseProfile from "@/components/BaleUI/IncomeExpenseProfile/IncomeExpenseProfile";

// interface Props {
//   buildingId: any;
//   userId: any;
// }

const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
const TOKEN2 = "WALLET-TEST-1111111111111111";
// هوک سفارشی برای دریافت شارژها
const useGroup = (userId: number) => {
  return useQuery({
    queryKey: ["group", userId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/telegram/building/findgroup/${userId}`,
      );
      console.log(data, "data");
      return data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export default function DashboardAdmin() {
  const { buildingId, userId } = useSelector(
    (state: RootState) => state.dataBale,
  );
  const { data: groupData, isLoading, isError, error } = useGroup(userId);
  const [showNoGroupModal, setShowNoGroupModal] = useState(false);

  const [openLink, setOpenLink] = useState(false);
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [openListUser, setOpenListUser] = useState(false);
  const [openGapMessage, setOpenGapMessage] = useState(false);
  const [chargeStatus, setChargeStatus] = useState(false);
  const [openUnpaidList, setOpenUnpaidList] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  // ✅ بررسی وجود گروه
  useEffect(() => {
    if (groupData && !isLoading) {
      const groups = groupData?.groups || [];
      const hasAnyGroup = groups.length > 0;

      setHasGroup(hasAnyGroup);

      // اگر گروه ندارد و اولین بار است که لود می‌شود، مودال را نشان بده
      if (!hasAnyGroup && hasGroup === null) {
        setShowNoGroupModal(true);
      }
    }
  }, [groupData, isLoading]);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [openFinancialProfile, setOpenFinancialProfile] = useState(false);
  const toggleFinancialProfile = useCallback(
    () => setOpenFinancialProfile((prev) => !prev),
    [],
  );
  console.log(window.Bale, "ffffff");
  // توابع ساده باز/بستن مودال‌ها (با استفاده از useCallback بهینه)
  const toggleLink = useCallback(() => setOpenLink((prev) => !prev), []);
  const toggleListUser = useCallback(
    () => setOpenListUser((prev) => !prev),
    [],
  );
  const toggleGapMessage = useCallback(
    () => setOpenGapMessage((prev) => !prev),
    [],
  );
  const toggleChargeStatus = useCallback(
    () => setChargeStatus((prev) => !prev),
    [],
  );
  const toggleExpense = useCallback(() => setOpenExpense((prev) => !prev), []);
  const handleToggleGapMessage = useCallback((state: boolean) => {
    setOpenGapMessage(state);
  }, []);
  const toggleOpenUnpaidList = useCallback(
    () => setOpenUnpaidList((prev) => !prev),
    [],
  );
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
      <Modal
        isOpen={showNoGroupModal}
        onClose={() => setShowNoGroupModal(false)}
        title="⚠️ عضویت ربات در گروه"
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
            ربات در گروه شما عضو نیست!
          </h3>
          <p className="text-gray-500 mb-6">
            برای استفاده از امکانات مدیریتی، لطفاً ربات را به گروه خود اضافه
            کنید.
          </p>

          {/* راهنما */}
          <div className="bg-gray-50 rounded-xl p-4 text-right mb-6">
            <h4 className="font-medium text-gray-700 mb-3">
              راهنمای اضافه کردن ربات:
            </h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۱
                </span>
                به گروه خود بروید
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۲
                </span>
                روی نام گروه کلیک کنید
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۳
                </span>
                گزینه "مدیران" را انتخاب کنید
                <br />
                سپس افوزدن مدیر جدید
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۴
                </span>
                ربات (hamyarmarloobot@) را جستجو و به گروه اضافه کنید و به عنوان
                مدیر اضافه کنید
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۵
                </span>
                سپس یک پیام خالی در گروه خود با این جمله
                <br />
                <code className="bg-gray-200  px-1 text-lg">AddGroup_1</code> را
                ارسال کنید.
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ۶
                </span>
                سپس پیام فعال شدن ربات در گروه نمایش داده میشود
              </li>
            </ol>
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-3 justify-center">
            {/* <motion.button
              onClick={() => setShowNoGroupModal(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              بعداً
            </motion.button> */}

            <motion.button
              onClick={() => {
                window.Bale?.WebApp?.close();
                setShowNoGroupModal(false);
              }}
              className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 اضافه کردن ربات
            </motion.button>
          </div>
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

        {/* ── دکمه لینک دعوت ──────────────────────────── */}
        <motion.button
          onClick={toggleLink}
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
          <RegisterDropdown />
          {/* ── دکمه لیست کاربران  ──────────────────────────── */}

          <motion.button
            onClick={toggleListUser}
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
          <button className="p-3 bg-amber-200" onClick={handleSendTest}>
            test پرداخت
          </button>
          {/* ── دکمه پیام در گروه   ──────────────────────────── */}

          <motion.button
            onClick={toggleGapMessage}
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

      {/* ========== مودال‌ها ========== */}
      <AnimatePresence>
        {openLink && (
          <ModalOverlay onClose={toggleLink}>
            <InviteLinkManager
              buildingId={buildingId}
              userId={userId}
              onClose={toggleLink}
            />
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openListUser && (
          <ModalOverlay onClose={toggleListUser}>
            <MemberForAdmin buildingId={buildingId} currentUserId={userId} />
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openGapMessage && (
          <ModalOverlay onClose={toggleGapMessage}>
            <SendToGroupForm buildingId={buildingId} userId={userId} />
          </ModalOverlay>
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
      {/* ////////////////////////////// */}
      {/* بخش بعدی بدنه*/}
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className=" rounded-2xl gap-2 flex flex-row bg-white p-3 shadow-sm ring-1 ring-gray-100  bg-linear-to-l from-[#424ebb] to-[#42bcc5] text-white"
        >
          <motion.button
            onClick={toggleChargeStatus}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              // animate={{ rotate: openCharge ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            پرداخت ها
          </motion.button>

          <motion.button
            onClick={toggleOpenUnpaidList}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              // animate={{ rotate: openCharge ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            پرداخت نشده ها
          </motion.button>
          <motion.button
            onClick={toggleExpense}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              // animate={{ rotate: openCharge ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            ثبت هزینه ها
          </motion.button>
          <motion.button
            onClick={toggleFinancialProfile}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            >
              📊
            </motion.span>
            نمایه خرج و دخل
          </motion.button>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {openUnpaidList && (
          <ModalOverlay onClose={toggleOpenUnpaidList}>
            <ListUnpaidCharges
              buildingId={buildingId}
              onClose={toggleOpenUnpaidList}
            />
          </ModalOverlay>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chargeStatus && (
          <ModalOverlay onClose={toggleChargeStatus}>
            <Suspense fallback={<LoadingSkeleton />}>
              <ListPay buildingId={buildingId} onClose={toggleChargeStatus} />
            </Suspense>
          </ModalOverlay>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openExpense && (
          <ModalOverlay onClose={toggleExpense}>
            <Suspense fallback={<LoadingSkeleton />}>
              <ExpenseManager
                buildingId={buildingId}
                managerId={userId.toString()}
                onClose={toggleExpense}
              />
            </Suspense>
          </ModalOverlay>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openFinancialProfile && (
          <ModalOverlay onClose={toggleFinancialProfile}>
            <Suspense fallback={<LoadingSkeleton />}>
              <IncomeExpenseProfile
                buildingId={buildingId}
                onClose={toggleFinancialProfile}
              />
            </Suspense>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== کامپوننت کمکی برای کاهش تکرار مودال‌ها ==========
function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 w-full max-w-md"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
