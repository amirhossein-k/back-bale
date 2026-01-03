// src\components\pay\Cart\CartPacakge.tsx

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Plan } from "@/types/pay";
import { pricingPlans } from "@/utils/plan";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types/pay";
import {
  CreditCard,
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

// تابع دریافت شماره از purchase
const fetchPurchaseByCode = async (
  codeYekta: string,
): Promise<{ phoneNumber: string; status?: string }> => {
  const response = await axios.get<ApiResponse<{ phoneNumber: string }>>(
    "/api/purchases/get",
    { params: { codeYekta } },
  );
  const data = response.data;
  if (!data.success || !data.data) {
    throw new Error(data.message || "خطا در دریافت اطلاعات خرید");
  }
  return data.data;
};

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
} as const;
// داخل کامپوننت، قبل از return یک Spinner ساده تعریف کنید
const Spinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

export default function CartPackage() {
  const router = useRouter();
  const { accessCart } = useSelector((state: RootState) => state.cartPlan);
  const { data: session, status: sessionStatus } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // ✅ گوش دادن به پیام موفقیت از تب پرداخت
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     // بررسی امنیت: فقط پیام‌های هم‌دامنه پذیرفته شوند
  //     if (event.origin !== window.location.origin) return;
  //     if (event.data === "payment_success") {
  //       sessionStorage.removeItem("selectedPlanId");
  //       router.push("/dashboard");
  //     }
  //   };
  //   window.addEventListener("message", handleMessage);
  //   const paymentSuccess = localStorage.getItem("payment_success");
  //   if (paymentSuccess === "true") {
  //     localStorage.removeItem("payment_success");

  //     router.push("/dashboard");
  //   }
  //   return () => window.removeEventListener("message", handleMessage);
  // }, [router]);

  // داخل CartPackage یا هر جایی که نیاز دارید
  // بررسی فلگ در هنگام mount اولیه
  ////////////////////////////
  const handleSuccessRedirect = () => {
    localStorage.removeItem("payment_success");
    sessionStorage.removeItem("selectedPlanId");
    document.cookie = "selectedPlanId=; path=/; max-age=0; SameSite=Lax;";
    router.replace("/");
  };

  // بررسی اولیه
  useEffect(() => {
    if (localStorage.getItem("payment_success") === "true") {
      handleSuccessRedirect();
    }
  }, []);

  // رویداد storage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "payment_success" && e.newValue === "true") {
        handleSuccessRedirect();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // رویداد visibilitychange
  useEffect(() => {
    const handler = () => {
      if (
        document.visibilityState === "visible" &&
        localStorage.getItem("payment_success") === "true"
      ) {
        handleSuccessRedirect();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Polling (هر ۲ ثانیه، تا ۳۰ ثانیه)
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (localStorage.getItem("payment_success") === "true") {
        handleSuccessRedirect();
        clearInterval(interval);
      }
      count++;
      if (count > 15) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  // ////////////////////////////////////
  // خواندن پلن از sessionStorage
  useEffect(() => {
    const storedId = sessionStorage.getItem("selectedPlanId");

    console.log(storedId, "storedId");
    if (storedId) {
      const found = pricingPlans.find((p) => p.id === storedId);
      setSelectedPlan(found || null);
      console.log("found");
    }
    setPlanLoaded(true);
  }, []);

  // ریدایرکت در صورت نبودن پلن یا دسترسی
  useEffect(() => {
    if (planLoaded && !selectedPlan) {
      console.log("selectedPlan", selectedPlan);
      console.log("planLoaded", planLoaded);
      router.replace("/");
    }
  }, [planLoaded, selectedPlan, router]);

  // دریافت شماره تماس (با safe navigation)
  const user = session?.user;
  const codeYekta = user?.codeYekta; // string | undefined

  const {
    data: purchaseData,
    isLoading: isPurchaseLoading,
    isError,
  } = useQuery({
    queryKey: ["purchase", codeYekta],
    queryFn: () => fetchPurchaseByCode(codeYekta!), // non-null assertion, اما چون enabled رو گذاشتیم فقط وقتی وجود داره اجرا میشه
    enabled: !!codeYekta,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (purchaseData?.status === "paid") {
      router.replace("/dashboard");
    }
  }, [purchaseData, router]);
  // رندرهای اولیه
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (sessionStatus === "unauthenticated") return <div>لطفاً وارد شوید</div>;
  if (!user) return <div>اطلاعات کاربر یافت نشد</div>;
  if (planLoaded && !selectedPlan) return <div>دسترسی غیر مجاز</div>;
  if (isPurchaseLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  if (isError)
    return (
      <div className="p-4 text-red-500 text-center">
        خطا در دریافت اطلاعات تماس
        <button onClick={() => router.prefetch("/cart")}>تلاش دوباره</button>
      </div>
    );

  const phoneNumber = purchaseData?.phoneNumber || user.phoneNumber || "نامشخص";
  const price = selectedPlan?.price ?? 0; // عدد واقعی (حتی اگر 0)
  const priceFormatted = price.toLocaleString("fa-IR"); // برای نمایش
  const tax = price * 0.01; // مالیات عددی
  const totalWithTax = price * 1.01; // کل قابل پرداخت عددی
  const totalWithTaxFormatted = totalWithTax.toLocaleString("fa-IR");

  let periodText = "";
  if (selectedPlan?.id === "monthly") periodText = "ماهیانه";
  else if (selectedPlan?.id === "quarterly") periodText = "سه‌ماهه";
  else if (selectedPlan?.id === "yearly") periodText = "سالانه";

  // جلوگیری از خطا برای features.length
  const features = selectedPlan?.features ?? [];

  // در CartPackage:
  const handlePayment = async () => {
    if (isPaying) return; // جلوگیری از double-click
    setIsPaying(true);

    // ✅ Validation اولیه
    if (!selectedPlan || !selectedPlan.price || !selectedPlan.id) {
      toast.error("مشکلی در اطلاعات پلن وجود دارد. لطفاً دوباره تلاش کنید.");
      return;
    }

    try {
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(selectedPlan.price * 1.01), // ✅ تبدیل به عدد
          planId: String(selectedPlan.id),
        }),
      });
      // ✅ مدیریت خطاهای HTTP
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        toast.error("خطا در ارتباط با سرور. لطفاً بعداً تلاش کنید.");
        return;
      }
      const result = await response.json();
      console.log(result, "result");
      // بررسی می‌کنیم که آیا پاسخ یک ریدایرکت است

      if (result.redirectUrl) {
        try {
          const baleWebApp = (window as any).Bale?.WebApp;
          if (baleWebApp?.openLink) {
            baleWebApp.openLink(result.redirectUrl, { try_instant_view: true });
          } else {
            // باز کردن لینک در تب جدید (یا همان صفحه)
            window.open(result.redirectUrl, "_blank");
          }
        } catch (err) {
          console.error("Error redirecting:", err);
          window.location.href = result.redirectUrl;
        }

        // ✅ روش اختصاصی بله برای باز کردن لینک در مرورگر داخلی (بدون خطای iframe)
        // const baleWebApp = (window as any).Bale?.WebApp;
        // if (baleWebApp?.openLink) {
        //   baleWebApp.openLink(result.redirectUrl, { try_instant_view: true });
        // } else {
        //   // Fallback: روش جایگزین برای هدایت
        //   window.location.href = result.redirectUrl;
        // }
      } else {
        console.error("خطا در دریافت لینک پرداخت", result.error);
        alert("خطا در ارتباط با درگاه پرداخت.");
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            🛒 سبد خرید
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            اطلاعات سفارش خود را بررسی کنید
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="w-6 h-6" />
                <span className="font-semibold">جزئیات اشتراک</span>
              </div>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                {periodText}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  {selectedPlan?.icon || (
                    <Calendar className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    پلن انتخابی
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPlan?.name}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-left">
                  <div className="mt-3 text-sm text-gray-600 text-center">
                    <div>مبلغ پایه: {priceFormatted} تومان</div>
                    <div>مالیات ۱٪: {tax.toLocaleString("fa-IR")} تومان</div>
                    <div className="font-bold text-lg text-green-700">
                      مبلغ قابل پرداخت: {totalWithTaxFormatted} تومان
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5" />
                <span>دوره اشتراک</span>
              </div>
              <span className="font-medium">{periodText}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5" />
                <span>شماره تماس</span>
              </div>
              <span className="font-mono font-medium" dir="ltr">
                {phoneNumber}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ✨ ویژگی‌های این پلن:
              </p>
              <ul className="space-y-1">
                {features.slice(0, 3).map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feat}
                  </li>
                ))}
                {features.length > 3 && (
                  <li className="text-sm text-gray-500">و ...</li>
                )}
              </ul>
            </div>
          </div>

          <div className="px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {isPaying ? (
                <span className="flex items-center gap-2">
                  <Spinner /> در حال اتصال به درگاه...
                </span>
              ) : (
                <span>پرداخت و تکمیل سفارش</span>
              )}{" "}
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              با کلیک روی دکمه پرداخت، به درگاه امن منتقل می‌شوید.
            </p>
          </div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-gray-400 dark:text-gray-500 text-xs mt-8"
        >
          در صورت بروز خطا با پشتیبانی تماس بگیرید.
        </motion.p>
      </motion.div>
    </div>
  );
}
