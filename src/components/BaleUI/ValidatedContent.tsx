// src/components/BaleUI/ValidatedContent.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  BaleReceiveEvent,
  BaleUser,
  WebAppOpenInvoiceParams,
} from "@/types/bale";
import { useQuery } from "@tanstack/react-query";
import { getQueryConfigUser } from "@/lib/queryConfig/telegram/createQueryConfig";
import DashboardAdmin from "../layout/DashboardAdmin/DashboardAdmin";
import DashboardUser from "../layout/DashboardUser/DashboardUser";
import { useCallback, useEffect, useState } from "react";

// ─── Variants (✅ corrected) ──────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
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

// ─── Spinner ───────────────────────────────────────────────
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

// ─── Error Card ────────────────────────────────────────────
function ErrorCard({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-lg"
    >
      <motion.span
        className="inline-block text-5xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        ❌
      </motion.span>
      <h3 className="mt-3 text-lg font-semibold text-red-800">
        خطا در دریافت اطلاعات
      </h3>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────
interface Props {
  user: BaleUser;
  isIframe: boolean;
  openInvoice: (
    params: WebAppOpenInvoiceParams,
    callback?: (status: string) => void,
  ) => void;
  closes: any;
}

export default function ValidatedContent({ user, isIframe, closes }: Props) {
  const [isBaleReady, setIsBaleReady] = useState(false);

  const handleClose = useCallback(() => {
    console.log("🔍 close function:", closes);
    console.log("🔍 typeof close:", typeof closes);
    console.log("🔍 window.Bale?.WebApp?.close:", window.Bale?.WebApp?.close);
    closes(); // اگر close undefined باشد این جا خطا می‌دهد
  }, []);

  const { data, isLoading, error } = useQuery(
    getQueryConfigUser({
      queryType: "userFetch",
      options: { userId: user.id },
    }),
  );

  // چک کردن آمادگی Bale SDK
  useEffect(() => {
    // اگر SDK از قبل آماده است
    if (window.Bale?.WebApp) {
      setIsBaleReady(true);
      return;
    }

    // گوش دادن به رویداد آماده‌سازی SDK
    const handleBaleReady = () => {
      console.log("Bale WebApp API is ready!");
      setIsBaleReady(true);
    };

    window.addEventListener("bale-web-app-ready", handleBaleReady);

    // همچنین چک دوره‌ای برای اطمینان
    const checkInterval = setInterval(() => {
      if (window.Bale?.WebApp) {
        console.log("Bale WebApp detected via interval check");
        setIsBaleReady(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // تایم‌اوت برای جلوگیری از چک بی‌نهایت
    const timeout = setTimeout(() => {
      console.warn("Bale WebApp not ready after timeout");
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      window.removeEventListener("bale-web-app-ready", handleBaleReady);
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  if (isBaleReady) {
    console.log("ready");
  }
  console.log(data, "data");
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <AnimatedSpinner />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm text-gray-400"
        >
          در حال بارگذاری اطلاعات شما...
        </motion.p>
      </div>
    );
  }

  if (error) return <ErrorCard message={error.message} />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-white via-indigo-50/20 to-white px-4 pb-8 pt-4"
    >
      <button onClick={handleClose}>پرداخت</button>{" "}
      <button
        className="mx-2"
        onClick={() => {
          console.log("wwww", window.Bale?.receiveEvent);
        }}
      >
        ddddddd
      </button>{" "}
      <AnimatePresence>
        {isIframe && (
          <motion.div
            key="expand-btn"
            variants={itemVariants}
            className="mb-6 flex justify-center"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        variants={cardVariants}
        className="mx-auto max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-gray-100"
      >
        <div className="bg-linear-to-r from-indigo-500 via-[#5363f7] to-[#7ad7f3] px-6 py-5">
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
              <p className="text-sm font-medium text-gray-800">
                {user.first_name} {user.last_name}
              </p>
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
              <p className="text-sm font-medium text-gray-800 font-mono">
                {user.id}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div variants={itemVariants} className="mt-6">
        <AnimatePresence mode="wait">
          {data?.role === "manager" ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <DashboardAdmin
                buildingId={data.buildings[0]?.id}
                userId={user.id}
              />
            </motion.div>
          ) : data?.role === "user" ? (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <DashboardUser />
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
