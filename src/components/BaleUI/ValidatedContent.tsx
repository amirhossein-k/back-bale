// src/components/BaleUI/ValidatedContent.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { BaleUser } from "@/types/bale";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DashboardAdmin from "../layout/DashboardAdmin/DashboardAdmin";
import DashboardUser from "../layout/DashboardUser/DashboardUser";
import DashboardModir from "../layout/DashboardModir/DashboardModir";
import { useEffect, useState } from "react";

// ─── Variants (تنها موارد استفاده شده) ──────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20, mass: 0.8 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 18, mass: 0.6 },
  },
};

// ─── کامپوننت‌های کوچک ──────────────────────────────────────
function AnimatedSpinner() {
  const dots = [0, 1, 2];
  return (
    <div className="flex items-center justify-center gap-2 py-12">
      {dots.map((i) => (
        <motion.span
          key={i}
          className="inline-block h-3 w-3 rounded-full bg-indigo-500"
          animate={{
            y: [0, -12, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ExpandButton() {
  return (
    <motion.button
      onClick={() => window.Bale?.WebApp?.expand?.()}
      whileHover={{
        scale: 1.04,
        boxShadow: "0 8px 25px rgba(108,71,255,0.35)",
      }}
      whileTap={{ scale: 0.96 }}
      className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-all"
    >
      <span className="flex items-center gap-2">
        <motion.span
          className="inline-block text-lg"
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🖥️
        </motion.span>
        باز کردن کامل مینی‌اپ
      </span>
    </motion.button>
  );
}

interface Props {
  user: BaleUser;
  isIframe: boolean;
}

export default function ValidatedContent({ user, isIframe }: Props) {
  const { role, botState } = useSelector(
    (state: RootState) => state.dataBale.user,
  );
  const isLoadingRole = role === undefined; // اگر نقش هنوز تنظیم نشده باشد
  const [showAwaitingMessage, setShowAwaitingMessage] = useState(false);

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "کاربر";

  // بررسی وضعیت awaiting_building_name
  useEffect(() => {
    if (botState === "awaiting_building_name" && !showAwaitingMessage) {
      setShowAwaitingMessage(true);
      // بستن خودکار مینی‌اپ بعد از 3 ثانیه (اختیاری)
      const timer = setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window as any).Bale?.WebApp?.close
        ) {
          (window as any).Bale.WebApp.close();
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [botState]);

  // اگر در وضعیت awaiting_building_name هستیم، پیام نمایش بده
  if (showAwaitingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            نیاز به راه‌اندازی مجدد
          </h2>
          <p className="text-gray-600 mb-6">
            لطفاً مینی‌اپ را ببندید و مجدداً ربات را با دستور{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">/start</code> باز
            کنید.
          </p>
          <button
            onClick={() => {
              if ((window as any).Bale?.WebApp?.close) {
                (window as any).Bale.WebApp.close();
              } else {
                alert("لطفاً این صفحه را ببندید و دوباره /start را بزنید.");
              }
            }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition"
          >
            بستن مینی‌اپ
          </button>
        </div>
      </div>
    );
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-white via-indigo-50/20 to-white px-4 pb-8 pt-4"
    >
      {/* دکمه Expand در صورت iframe */}
      <AnimatePresence>
        {isIframe && (
          <motion.div
            key="expand-btn"
            variants={itemVariants}
            className="mb-6 flex justify-center"
          >
            <ExpandButton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* کارت اطلاعات کاربر */}
      <motion.div
        variants={cardVariants}
        className="mx-auto max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-gray-100"
      >
        <div className="bg-gradient-to-r from-indigo-500 via-[#5363f7] to-[#7ad7f3] px-6 py-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring" }}
            className="flex items-center gap-3"
          >
            <motion.span
              className="inline-block text-3xl"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🏠
            </motion.span>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-sm">
                به مینی‌اپ خوش آمدید!
              </h1>
              <p className="text-sm text-white/80">مدیریت ساختمان هوشمند</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          className="space-y-3 px-6 py-5"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 rounded-xl bg-indigo-50/60 p-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg">
              👤
            </span>
            <div>
              <p className="text-xs text-gray-400">نام کاربر</p>
              <p className="text-sm font-medium text-gray-800">{fullName}</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 rounded-xl bg-indigo-50/60 p-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg">
              🆔
            </span>
            <div>
              <p className="text-xs text-gray-400">شناسه کاربر</p>
              <p className="font-mono text-sm font-medium text-gray-800">
                {user.id}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* داشبورد بر اساس نقش */}
      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {isLoadingRole ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10"
            >
              <AnimatedSpinner />
            </motion.div>
          ) : role === "admin" ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <DashboardAdmin />
            </motion.div>
          ) : role === "user" ? (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <DashboardUser />
            </motion.div>
          ) : role === "modir" ? (
            <motion.div
              key="modir"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <DashboardModir />
            </motion.div>
          ) : (
            <motion.div
              key="guest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-amber-50 p-6 text-center shadow-sm ring-1 ring-amber-200"
            >
              <motion.span
                className="inline-block text-4xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👋
              </motion.span>
              <p className="mt-2 font-medium text-amber-800">
                شما کاربر عادی هستید. برای دسترسی به امکانات با مدیر ساختمان
                تماس بگیرید.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 text-center text-xs text-gray-400"
      >
        ساخته شده با ❤️ برای بله
      </motion.div>
    </motion.div>
  );
}
