// components/InviteLinkManager.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface Props {
  buildingId: string;
  userId: number;
  onClose: () => void;
}

export default function InviteLinkManager({
  buildingId,
  userId,
  onClose,
}: Props) {
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadInviteLink = useCallback(async () => {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/telegram/building/getInviteLink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId, userId }),
      });
      const data = await res.json();
      if (data.inviteLink) {
        setInviteLink(data.inviteLink);
      } else {
        setError(data.error || "خطا در دریافت لینک");
      }
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }, [buildingId, userId]);

  useEffect(() => {
    loadInviteLink();
  }, [loadInviteLink]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // fallback برای مرورگرهای قدیمی
      const textarea = document.createElement("textarea");
      textarea.value = inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteLink]);

  // ── حالت بارگذاری ──────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-white p-8 text-center shadow-xl"
      >
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-3 w-3 rounded-full bg-indigo-400"
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-400">در حال دریافت لینک...</p>
      </motion.div>
    );
  }

  // ── حالت خطا ────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-xl"
      >
        <motion.span
          className="inline-block text-4xl"
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 0.5 }}
        >
          ❌
        </motion.span>
        <p className="mt-2 font-medium text-red-800">{error}</p>
        <motion.button
          onClick={loadInviteLink}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-red-600"
        >
          🔄 تلاش مجدد
        </motion.button>
      </motion.div>
    );
  }

  // ── حالت موفق ───────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="overflow-hidden rounded-2xl bg-white shadow-xl"
    >
      {/* هدر */}
      <div className="flex items-center justify-between bg-gradient-to-l from-indigo-500 to-purple-500 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <motion.span
            className="inline-block text-xl"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔗
          </motion.span>
          <h3 className="text-base font-bold">لینک دعوت ساختمان</h3>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm backdrop-blur-sm transition-colors hover:bg-white/30"
          aria-label="بستن"
        >
          ✕
        </motion.button>
      </div>

      {/* بدنه */}
      <div className="space-y-4 p-5">
        <p className="text-center text-sm text-gray-500">
          این لینک را برای کاربران ارسال کنید تا به ساختمان شما بپیوندند
        </p>

        {/* باکس لینک */}
        <motion.div
          layout
          className="relative rounded-xl bg-gray-50 p-4 text-center font-mono text-sm text-gray-700 ring-1 ring-gray-200"
        >
          <span className="break-all">{inviteLink}</span>
          <motion.button
            onClick={copyToClipboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${
              copied
                ? "bg-green-500 text-white"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {copied ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block"
                >
                  ✅
                </motion.span>
                کپی شد!
              </>
            ) : (
              <>📋 کپی لینک</>
            )}
          </motion.button>
        </motion.div>

        {/* دکمه دریافت مجدد */}
        <motion.button
          onClick={loadInviteLink}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            🔄
          </motion.span>
          دریافت لینک جدید
        </motion.button>
      </div>
    </motion.div>
  );
}
