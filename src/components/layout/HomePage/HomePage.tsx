"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Building,
  Bell,
  CreditCard,
  BarChart3,
  CheckCircle,
  Shield,
  Zap,
  Users,
  Calendar,
  Home,
  Info,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ApiResponse, Plan } from "@/types/pay";
import PlanCard from "@/components/pay/PlanCard";
import { signOut } from "next-auth/react";
// --- تابع دریافت پلن‌ها ---
// const fetchPlans = async (): Promise<Plan[]> => {
//   const response = await axios.get<ApiResponse<Plan[]>>("/api/plans");
//   const data = response.data;
//   if (!data.success || !data.data) {
//     throw new Error(data.message || "خطا در دریافت پلن‌ها");
//   }
//   return data.data;
// };

export default function HomePage() {
  const router = useRouter();

  // useEffect(() => {
  //   document.cookie = "selectedPlanId=; path=/; max-age=0; SameSite=Lax;";

  //   // 2. حذف آیتم از sessionStorage
  //   sessionStorage.removeItem("selectedPlanId");
  //   signOut({ redirect: false });
  // }, []);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  // دریافت پلن‌ها
  // const {
  //   data: plans = [],
  //   isLoading,
  //   error,
  // } = useQuery<Plan[], Error>({
  //   queryKey: ["plans"],
  //   queryFn: fetchPlans,
  //   staleTime: 5 * 60 * 1000,
  //   retry: 2,
  // });

  const handleSelectPlan = (plan: Plan): void => {
    setSelectedPlan(plan);
  };

  const handleBuy = (): void => {
    if (!selectedPlan) return;
    const planId = selectedPlan.id; // فقط id
    // ذخیره در sessionStorage (برای کامپوننت‌های سمت کلاینت)
    sessionStorage.setItem("selectedPlanId", planId);
    // ذخیره در Cookie (برای middleware در صورت نیاز)
    setTimeout(
      () => {
        sessionStorage.removeItem("selectedPlanId");
      },
      30 * 60 * 1000,
    );
    document.cookie = `selectedPlanId=${planId}; path=/; max-age=${30 * 60};  SameSite=Lax;`;
    router.push("/login");
  };
  // ===== Variants با as const برای رفع خطای TypeScript =====
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring" as const,
        stiffness: 300,
      },
    },
  } as const;

  // ===== ویژگی‌های اصلی بازو =====
  const features = [
    {
      icon: <Building className="w-8 h-8" />,
      title: "مدیریت ساختمان",
      description: "مدیریت کامل ساختمان با قابلیت‌های پیشرفته",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "اطلاع‌رسانی هوشمند",
      description: "ارسال اطلاعیه‌های مهم به ساکنین",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "پرداخت سریع",
      description: "پرداخت آنلاین شارژ و هزینه‌های ساختمان",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "مدیریت مالی",
      description: "گزارش‌های مالی دقیق و شفاف",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "مدیریت واحدها",
      description: "مدیریت اطلاعات واحدها و ساکنین",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "برنامه‌ریزی",
      description: "برنامه‌ریزی جلسات و رویدادها",
    },
  ];

  // ===== پلن‌های قیمت‌گذاری =====
  const pricingPlans: Plan[] = [
    {
      id: "monthly",
      name: "ماهانه",
      price: 10000,
      period: "تومان / ماه",
      description: "",
      features: [
        "مدیریت حرفه ای",
        "اطلاعیه ها",
        "گزارش‌های پایه",
        "پرداخت سریع و اسان شارژ",
        "پشتیبانی 24 ساعته",
      ],
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "quarterly",
      name: "سه‌ماهه",
      price: 850000,
      period: "تومان / سه‌ماهه",
      description: "",
      features: [
        "مدیریت حرفه ای",
        "اطلاعیه ها",
        "گزارش‌های پایه",
        "پرداخت سریع و اسان شارژ",
        "پشتیبانی 24 ساعته",
      ],
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: "yearly",
      name: "سالانه",
      price: 4000000,
      period: "تومان / سال",
      description: "",
      features: [
        "مدیریت حرفه ای",
        "اطلاعیه ها",
        "گزارش‌های پایه",
        "پرداخت سریع و اسان شارژ",
        "پشتیبانی 24 ساعته",
      ],
      icon: <Zap className="w-6 h-6" />,
    },
  ];

  // ===== تابع انتخاب پلن =====
  // const handlePlanSelect = (planId: "monthly" | "quarterly" | "yearly") => {
  //   setSelectedPlan(planId);
  //   setIsPlanSelected(true);
  // };

  // ===== تابع رفتن به بازوبله =====
  const handleGoToBaleBot = () => {
    // اینجا می‌توانید منطق باز کردن ربات در بله را اضافه کنید
    window.open("https://ble.ir/hamyarmarloobot", "_blank");
  };

  const enamadCode = `
    <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=726453&Code=tbRqUuHnF4S4EwJ6ovPYqPcheHJtAnSM'>
      <img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=726453&Code=tbRqUuHnF4S4EwJ6ovPYqPcheHJtAnSM' alt='نماد اعتماد الکترونیکی' style='cursor:pointer; height: 64px; width: auto;' code='tbRqUuHnF4S4EwJ6ovPYqPcheHJtAnSM'>
    </a>
  `;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* ===== هدر با لینک درباره ما ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مارلو</h1>
                <p className="text-sm text-gray-500">مدیریت هوشمند ساختمان</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6 gap-2 rtl:space-x-reverse">
              <Link
                href="/about"
                className="flex items-center space-x-2 border-b py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="font-medium">درباره ما</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center space-x-2 border-b py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="font-medium">تماس با ما</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== بخش اصلی ===== */}
      <main className="container mx-auto px-4 py-8">
        {/* ===== هیرو ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">راه‌حل جامع مدیریت ساختمان</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            مدیریت ساختمان خود را به{" "}
            <span className="text-blue-600">مارلو</span> بسپارید
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            با بازو، مدیریت ساختمان را ساده، هوشمند و بدون دردسر تجربه کنید. از
            اطلاع‌رسانی تا پرداخت، همه چیز در یک پلتفرم.
          </p>
        </motion.div>

        {/* ===== ویژگی‌ها ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ویژگی‌های اصلی بازو
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== قیمت‌گذاری ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            انتخاب پلن مناسب
          </h2>
          {/* حالت بارگذاری */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan?.id === plan.id
                    ? "border-blue-500 bg-blue-50 shadow-xl"
                    : "border-gray-200 bg-white shadow-lg"
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  isSelected={selectedPlan?.id === plan.id}
                  onSelect={handleSelectPlan}
                />
              </motion.div>
            ))}
          </div>

          {/* ===== دکمه رفتن به بازوبله ===== */}
          {/* دکمه خرید */}
          {/* توضیح مالیات */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              * مبالع نمایش داده شده، بدون احتساب مالیات ۱٪ می‌باشد. مبلغ نهایی
              شامل ۱٪ مالیات خواهد شد.
            </p>
          </div>
          <motion.div
            className="flex justify-center flex-col items-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={handleBuy}
              disabled={!selectedPlan}
              whileHover={selectedPlan ? { scale: 1.05 } : {}}
              whileTap={selectedPlan ? { scale: 0.95 } : {}}
              className={`
              px-12 py-4 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg
              ${
                selectedPlan
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            >
              {/* ///////// */}
              {selectedPlan
                ? `خرید ${selectedPlan.name} - ${selectedPlan.price.toLocaleString("fa-IR")} تومان`
                : "لطفاً یک پلن انتخاب کنید"}
            </motion.button>

            {/* نمایش جزئیات مالیات در صورت انتخاب پلن */}
            {selectedPlan && (
              <div className="mt-3 text-sm text-gray-600 text-center">
                <div>
                  مبلغ پایه: {selectedPlan.price.toLocaleString("fa-IR")} تومان
                </div>
                <div>
                  مالیات ۱٪:{" "}
                  {(selectedPlan.price * 0.01).toLocaleString("fa-IR")} تومان
                </div>
                <div className="font-bold text-green-700">
                  مبلغ قابل پرداخت:{" "}
                  {(selectedPlan.price * 1.01).toLocaleString("fa-IR")} تومان
                </div>
              </div>
            )}

            {/* //////// */}
          </motion.div>
        </motion.div>

        {/* ===== بخش درباره ما ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 mb-20"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Info className="w-10 h-10 text-blue-600 ml-4" />
              <h2 className="text-3xl font-bold text-gray-900">درباره ما</h2>
            </div>

            <div className="space-y-6 text-gray-700">
              <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🏢 درباره بازو
                </h3>
                <p className="leading-relaxed">
                  این مینی‌اپ برای <strong>ربات بازو (@hamyarmarloobot)</strong>{" "}
                  طراحی شده است. بازو یک راه‌حل جامع برای مدیریت هوشمند
                  ساختمان‌ها در بستر پیام‌رسان بله است.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  👥 تیم مارلو
                </h3>
                <p className="leading-relaxed mb-4">
                  تیم <strong>مارلو</strong> متخصص در توسعه وب‌اپلیکیشن‌های مدرن
                  و راه‌حل‌های نرم‌افزاری است. ما در تهران فعالیت داریم و بر
                  ارائه خدمات با کیفیت در بستر بله تمرکز کرده‌ایم.
                </p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                    <span>توسعه وب‌اپلیکیشن</span>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    <Building className="w-4 h-4" />
                    <span>راه‌حل‌های مدیریت ساختمان</span>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-purple-100 text-purple-700 px-4 py-2 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span>پلتفرم بله</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📞 تماس با ما
                </h3>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">شماره تماس:</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ۰۹۳۹۱۴۷۰۴۲۷
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      برای مشاوره و راه‌اندازی سرویس بازو در ساختمان خود
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🎯 ماموریت ما
                </h3>
                <p className="leading-relaxed">
                  ما در تیم مارلو معتقدیم که مدیریت ساختمان باید ساده، شفاف و
                  کارآمد باشد. با استفاده از پلتفرم بله، سرویس بازو را توسعه
                  داده‌ایم تا مدیران ساختمان‌ها بتوانند به راحتی و با کمترین
                  هزینه، ساختمان خود را مدیریت کنند.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ===== فوتر ===== */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="">
              <Link
                href="/terms"
                className="flex items-center space-x-2 text-gray-300 hover:text-blue-600 transition-colors"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium"> قوانین </span>
              </Link>
            </div>
            <section
              className="py-3 bg-[#05516d]"
              style={{ boxShadow: "0px 0px 18px -1px #fff" }}
            >
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-8">
                  اعتماد و اطمینان
                </h2>
                <div
                  className="enamad-badge flexx justify-center items-center "
                  dangerouslySetInnerHTML={{ __html: enamadCode }}
                ></div>
              </div>
            </section>
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Building className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">مارلو</span>
              </div>
              <p className="text-gray-400">مدیریت هوشمند ساختمان در بستر بله</p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">توسعه‌یافته توسط تیم مارلو</p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} - تمامی حقوق محفوظ است
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
