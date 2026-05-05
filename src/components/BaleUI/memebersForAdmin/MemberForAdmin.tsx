// src\components\BaleUI\memebersForAdmin\MemberForAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface Member {
  _id: string;
  userId: {
    _id: string;
    telegramId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
  };
  role: "admin" | "member";
  joinedAt: string;
}

interface Props {
  buildingId: any;
  currentUserId: string; // شناسه کاربر لاگین‌شده (برای بررسی دسترسی)
}

export default function MemberForAdmin({ buildingId, currentUserId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // _id عضو در حال پردازش

  // ── مودال ارسال پیام ───────────────────────────────────
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageChannel, setMessageChannel] = useState<"bale" | "sms">("bale");
  const [sendingMessage, setSendingMessage] = useState(false);
  console.log(buildingId, "buildingId UI");
  // ── دریافت اعضا ─────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/telegram/building/${buildingId}/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setMembers(data.members || []);
    } catch (e: any) {
      setError(e.message || "خطا در دریافت اعضا");
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── تغییر نقش ──────────────────────────────────────────
  const handleRoleChange = async (
    memberId: string,
    newRole: "admin" | "member",
  ) => {
    setActionLoading(memberId);
    try {
      const res = await fetch(
        `/api/telegram/building/${buildingId}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole, userId: currentUserId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      // به‌روزرسانی لوکال
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m)),
      );
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── حذف عضو ────────────────────────────────────────────
  const handleDelete = async (memberId: string) => {
    const confirmed = window.confirm("آیا از حذف این عضو اطمینان دارید؟");
    if (!confirmed) return;

    setActionLoading(memberId);
    try {
      const res = await fetch(
        `/api/telegram/building/${buildingId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── ارسال پیام ─────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch(
        `/api/telegram/building/${buildingId}/members/${selectedMemberId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: messageText,
            channel: messageChannel,
            userId: currentUserId,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      // بستن مودال
      setShowMessageModal(false);
      setMessageText("");
      setSelectedMemberId(null);
      alert("✅ پیام با موفقیت ارسال شد");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // ── باز کردن مودال ─────────────────────────────────────
  const openMessageModal = (memberId: string) => {
    setSelectedMemberId(memberId);
    setMessageText("");
    setShowMessageModal(true);
  };

  // ── نمایش لودینگ ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-4 w-4 rounded-full bg-indigo-400"
              animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── نمایش خطا ──────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-red-50 p-8 text-center"
      >
        <p className="text-lg font-medium text-red-700">{error}</p>
        <button
          onClick={fetchMembers}
          className="mt-4 rounded-lg bg-red-500 px-5 py-2 text-sm text-white"
        >
          🔄 تلاش مجدد
        </button>
      </motion.div>
    );
  }

  // ── بدنه اصلی ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
    >
      {/* هدر */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">👥 اعضای ساختمان</h3>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
          {members.length} عضو
        </span>
      </div>

      {/* لیست اعضا */}
      <AnimatePresence>
        {members.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-gray-400"
          >
            هیچ عضوی یافت نشد
          </motion.p>
        ) : (
          <ul className="space-y-3">
            {members.map((member, index) => (
              <motion.li
                key={member._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                {/* آواتار */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-sm font-bold text-white">
                  {member.userId?.firstName?.[0] || "?"}
                </div>

                {/* اطلاعات */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-800">
                    {member.userId?.firstName || "نامشخص"}{" "}
                    {member.userId?.lastName || ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{member.userId?.username || "---"}
                  </p>
                </div>

                {/* نقش */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    member.role === "admin"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {member.role === "admin" ? "مدیر" : "عضو"}
                </span>

                {/* دکمه‌ها */}
                <div className="flex items-center gap-1">
                  {/* تغییر نقش */}
                  <motion.button
                    onClick={() =>
                      handleRoleChange(
                        member._id,
                        member.role === "admin" ? "member" : "admin",
                      )
                    }
                    disabled={actionLoading === member._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg p-2 text-sm transition-colors hover:bg-indigo-100 disabled:opacity-50"
                    title="تغییر نقش"
                  >
                    🔄
                  </motion.button>

                  {/* ارسال پیام */}
                  <motion.button
                    onClick={() => openMessageModal(member._id)}
                    disabled={actionLoading === member._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg p-2 text-sm transition-colors hover:bg-green-100 disabled:opacity-50"
                    title="ارسال پیام"
                  >
                    💬
                  </motion.button>

                  {/* حذف */}
                  <motion.button
                    onClick={() => handleDelete(member._id)}
                    disabled={actionLoading === member._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg p-2 text-sm transition-colors hover:bg-red-100 disabled:opacity-50"
                    title="حذف عضو"
                  >
                    🗑️
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>

      {/* ── مودال ارسال پیام ────────────────────────────── */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h4 className="mb-4 text-lg font-bold text-gray-800">
                ✉️ ارسال پیام به عضو
              </h4>

              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* انتخاب کانال */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMessageChannel("bale")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      messageChannel === "bale"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    🤖 بله
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel("sms")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      messageChannel === "sms"
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    📱 SMS
                  </button>
                </div>

                {/* متن پیام */}
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  placeholder="متن پیام را وارد کنید..."
                  className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />

                {/* دکمه ارسال */}
                <motion.button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-500 py-3 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      در حال ارسال...
                    </>
                  ) : (
                    "📨 ارسال پیام"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
