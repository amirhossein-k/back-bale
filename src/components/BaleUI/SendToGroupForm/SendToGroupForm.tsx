// components/SendToGroupForm.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BotGroup } from "@/types/bale";
import { getQueryConfigAvailableGroups } from "@/lib/queryConfig/telegram/group/createQueryConfig";

interface Props {
  buildingId: any;
  userId: any; // telegramId کاربر (string)
}

export default function SendToGroupForm({ buildingId, userId }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<BotGroup | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // ─── استفاده از React Query ──────────────────────────
  const queryOptions = getQueryConfigAvailableGroups({
    options: { buildingId, userId },
  });
  const {
    data: groups,
    isLoading,
    error: fetchError,
    isError,
  } = useQuery(queryOptions);

  // ─── ارسال پیام به گروه (هنوز API نوشته نشده فعلاً شبیه‌سازی) ──
  const handleSend = async () => {
    if (!selectedGroup || !message.trim()) return;
    setSending(true);
    setSendError("");

    try {
      // فرض: API ارسال پیام وجود دارد (POST /api/telegram/send-to-group)
      const res = await fetch("/api/telegram/send-to-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedGroup.chatId,
          text: message,
          userId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "خطا در ارسال پیام");
      }

      alert("✅ پیام با موفقیت ارسال شد");
      setMessage("");
    } catch (err: any) {
      setSendError(err.message || "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  // ─── انیمیشن‌ها ────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-md mx-auto bg-white  text-black rounded-2xl shadow-xl p-6 space-y-5"
    >
      <h2 className="text-2xl font-bold text-black text-center">
        ارسال پیام به گروه
      </h2>

      {/* حالت لودینگ */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* حالت خطا هنگام دریافت گروه‌ها */}
      {isError && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-red-100  text-red-700  p-3 rounded-lg text-sm"
        >
          {fetchError?.message || "خطا در دریافت گروه‌ها"}
          {fetchError?.message?.includes("AddGroup_1") === false && (
            <div className="mt-2 text-xs bg-gray-100  p-2 rounded">
              📌 راهنما: ربات را به گروه اضافه کنید و سپس در آن گروه پیام{" "}
              <code className="bg-gray-200 px-1">AddGroup_1</code> را ارسال
              کنید.
            </div>
          )}
        </motion.div>
      )}

      {/* حالت موفقیت و نمایش فرم */}
      {!isLoading && !isError && (
        <AnimatePresence mode="wait">
          <motion.div className="space-y-4" variants={containerVariants}>
            {/* اگر گروهی وجود ندارد */}
            {(!groups || groups.length === 0) && (
              <div className="text-center py-4 text-gray-500 ">
                <p>🔹 هیچ گروهی ثبت نشده است.</p>
                <p className="text-xs mt-2">
                  اگر گروه یافت نشد لطفا چک کنید ربات در گروه قرار دارد و تمام
                  دسترسی ها را داده اید و سپس یک پیام خالی در گروه خود با این
                  جمله
                  <br />
                  <code className="bg-gray-200  px-1 text-lg">
                    AddGroup_1
                  </code>{" "}
                  را ارسال کنید.
                </p>
              </div>
            )}

            {/* انتخاب گروه */}
            {groups && groups.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">
                  گروه مورد نظر
                </label>
                <motion.select
                  value={selectedGroup?.chatId || ""}
                  onChange={(e) => {
                    const chatId = Number(e.target.value);
                    const group = groups.find((g) => g.chatId === chatId);
                    setSelectedGroup(group || null);
                  }}
                  className="w-full p-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- انتخاب کنید --</option>
                  {groups.map((group) => (
                    <option key={group.chatId} value={group.chatId}>
                      {group.title} (ID: {group.chatId})
                    </option>
                  ))}
                </motion.select>
              </div>
            )}

            {/* متن پیام */}
            <div>
              <label className="block text-sm font-medium text-gray-700  mb-1">
                متن پیام
              </label>
              <motion.textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="w-full p-2 border border-gray-300 text-black rounded-lg bg-white  focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* پیام خطای ارسال */}
            {sendError && (
              <div className="bg-red-100  text-red-700 p-2 rounded text-sm">
                {sendError}
              </div>
            )}

            {/* دکمه ارسال */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || !selectedGroup || !message.trim()}
              className={`w-full py-2 rounded-lg font-medium text-white transition-colors ${
                sending || !selectedGroup || !message.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال ارسال...
                </div>
              ) : (
                "ارسال پیام"
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
