import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  getQueryConfigUser,
  UserModelResponse,
} from "@/lib/queryConfig/telegram/createQueryConfig";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { DateBaleSetAction, UserSetAction } from "@/store/Slice/BaleDateSlice";
import { BaleUser } from "@/types/bale";
import HomePage from "../layout/HomePage/HomePage";
import { useRouter } from "next/navigation";
import {
  getStatusUser,
  getUser,
  StatusResponse,
} from "@/lib/queryConfig/telegram/Req";
import { getUserQuery } from "@/app/api/telegram/user/get/route";
interface Props {
  user: BaleUser;
  isIframe: boolean;
}

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
const BaleCheck = ({ user, isIframe }: Props) => {
  const [isBaleReady, setIsBaleReady] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
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

  const userQuery = useQuery<getUserQuery>({
    queryKey: ["userModelFetch", user.id],
    queryFn: () => getUser(user.id),
    enabled: !!user.id,
    staleTime: 1000 * 60 * 5,
  });

  const statusQuery = useQuery<StatusResponse>({
    queryKey: ["userFetch", user.id],
    queryFn: () => getStatusUser(user.id),
    enabled: !!user.id,
    staleTime: 1000 * 60 * 5,
  });
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = userQuery;
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = statusQuery;

  useEffect(() => {
    if (!userData || !statusData) return;

    dispatch(UserSetAction({ user: userData }));

    if (userData.role === "none") {
      dispatch(
        DateBaleSetAction({
          buildingId: "",
          userId: user.id,
          bildingsId: [],
        }),
      );
      // ✅ برای کاربران ثبت‌نام نکرده، هدایت انجام نشود
      return;
    }

    // نقش‌های دارای دسترسی
    if (statusData?.role === "manager" || statusData?.role === "user") {
      dispatch(
        DateBaleSetAction({
          buildingId: statusData.buildings[0]?.id || "",
          userId: user.id,
          bildingsId: [],
        }),
      );
    } else if (statusData?.role === "modir") {
      dispatch(
        DateBaleSetAction({
          buildingId: "",
          userId: user.id,
          bildingsId: statusData.bilding ?? [],
        }),
      );
    }

    router.push("/dashboard");
  }, [userData, statusData, dispatch, router, user.id]);

  // 4. مدیریت بارگذاری اولیه (منتظر هر دو کوئری)
  if (userLoading || statusLoading) {
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
  if (userError) return <ErrorCard message={userError.message} />;
  if (statusError) return <ErrorCard message={statusError.message} />;

  return <HomePage />;
};

export default BaleCheck;
