"use client";

import { motion } from "framer-motion";
import {
  Building,
  Users,
  Phone,
  Mail,
  MapPin,
  Target,
  Shield,
  Zap,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
  Smartphone,
  Globe,
  Star,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  // ===== Variants با as const برای رفع خطای TypeScript =====
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -8,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.12)",
      transition: {
        type: "spring" as const,
        stiffness: 300,
      },
    },
  } as const;

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 12,
      },
    },
  } as const;

  // ===== اطلاعات تیم =====
  const teamInfo = {
    name: "تیم مارلو",
    location: "تهران، ایران",
    phone: "۰۹۳۹۱۴۷۰۴۲۷",
    email: "info@marloo.shop",
    website: "marloo.shop",
  };

  // ===== ارزش‌های تیم =====
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "تعهد و کیفیت",
      description: "ما به کیفیت کار و تعهد به مشتری اعتقاد داریم",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "نوآوری",
      description: "با جدیدترین تکنولوژی‌های روز دنیا کار می‌کنیم",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "پشتیبانی",
      description: "پشتیبانی ۲۴ ساعته در کنار شما هستیم",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "اعتماد",
      description: "حریم خصوصی و امنیت اطلاعات شما برای ما اولویت است",
    },
  ];

  // ===== سرویس‌های ما =====
  const services = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "توسعه Mini App بله",
      description: "طراحی و توسعه مینی‌اپ‌های حرفه‌ای در بستر پیام‌رسان بله",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "وب‌اپلیکیشن",
      description: "توسعه وب‌اپلیکیشن‌های مدرن با React, Next.js و Tailwind",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "ربات‌های هوشمند",
      description: "طراحی ربات‌های تلگرام و بله با قابلیت‌های پیشرفته",
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "مدیریت ساختمان",
      description: "راه‌حل‌های جامع مدیریت ساختمان با سرویس بازو",
    },
  ];

  // ===== آمار =====
  const stats = [
    { number: "۵۰+", label: "پروژه موفق" },
    { number: "۳۰+", label: "مشتری راضی" },
    { number: "۳", label: "سال تجربه" },
    { number: "۲۴/۷", label: "پشتیبانی" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ===== هدر ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link
                href="/"
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">بازگشت به صفحه اصلی</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">مارلو</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* ===== هیرو بخش درباره ما ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Star className="w-5 h-5" />
              <span className="font-medium">درباره ما</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            ما که هستیم؟
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            {teamInfo.name} متشکل از تیمی خلاق و متخصص در زمینه توسعه
            وب‌اپلیکیشن‌های مدرن
          </motion.p>
        </motion.div>

        {/* ===== ماموریت و معرفی ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
        >
          {/* ===== معرفی بازو ===== */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="p-4 bg-blue-50 rounded-2xl w-fit mb-6">
              <Building className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🏢 درباره بازو
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              این مینی‌اپ برای <strong>ربات بازو (@hamyarmarloobot)</strong>{" "}
              طراحی شده است. بازو یک راه‌حل جامع برای مدیریت هوشمند ساختمان‌ها
              در بستر پیام‌رسان بله است.
            </p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-green-50 text-green-700 px-4 py-2 rounded-lg w-fit">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">فعال در بستر بله</span>
            </div>
          </motion.div>

          {/* ===== معرفی تیم مارلو ===== */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="p-4 bg-purple-50 rounded-2xl w-fit mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              👥 تیم مارلو
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              تیم ما متخصص در توسعه وب‌اپلیکیشن‌های مدرن و راه‌حل‌های نرم‌افزاری
              است. ما در تهران فعالیت داریم و بر ارائه خدمات با کیفیت در بستر
              بله تمرکز کرده‌ایم.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                توسعه وب
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                مینی‌اپ بله
              </span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm">
                مدیریت ساختمان
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ===== آمار ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center text-white"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== ارزش‌های تیم ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ارزش‌های ما
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اصولی که در هر پروژه به آن پایبند هستیم
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center"
              >
                <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-4">
                  <div className="text-blue-600">{value.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== سرویس‌های ما ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              سرویس‌های ما
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              خدماتی که در بستر بله و وب ارائه می‌دهیم
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-start space-x-4 rtl:space-x-reverse"
              >
                <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                  <div className="text-blue-600">{service.icon}</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== تیم مارلو (جزئیات کامل) ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              اطلاعات تماس
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ما همیشه در کنار شما هستیم
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ===== اطلاعات تماس ===== */}
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                📞 با ما در تماس باشید
              </h3>

              <div className="space-y-6">
                {/* شماره تماس */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse bg-white p-4 rounded-xl shadow-sm">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">شماره تماس</p>
                    <p
                      className="text-lg font-bold text-gray-900 ltr"
                      dir="ltr"
                    >
                      {teamInfo.phone}
                    </p>
                  </div>
                </div>

                {/* ایمیل */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse bg-white p-4 rounded-xl shadow-sm">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ایمیل</p>
                    <p
                      className="text-lg font-bold text-gray-900 ltr"
                      dir="ltr"
                    >
                      {teamInfo.email}
                    </p>
                  </div>
                </div>

                {/* آدرس */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse bg-white p-4 rounded-xl shadow-sm">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">مکان</p>
                    <p className="text-lg font-bold text-gray-900">
                      {teamInfo.location}
                    </p>
                  </div>
                </div>

                {/* وبسایت */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse bg-white p-4 rounded-xl shadow-sm">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">وبسایت</p>
                    <p
                      className="text-lg font-bold text-blue-600 ltr"
                      dir="ltr"
                    >
                      {teamInfo.website}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ===== ماموریت و هدف ===== */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                🎯 ماموریت ما
              </h3>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                  <p className="text-gray-700 leading-relaxed">
                    ما در {teamInfo.name} معتقدیم که مدیریت ساختمان باید ساده،
                    شفاف و کارآمد باشد. با استفاده از پلتفرم بله، سرویس{" "}
                    <strong>بازو</strong> را توسعه داده‌ایم تا مدیران ساختمان‌ها
                    بتوانند به راحتی و با کمترین هزینه، ساختمان خود را مدیریت
                    کنند.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-2">✅ چرا بازو؟</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                      کاملاً در بستر بله و بدون نیاز به نصب
                    </li>
                    <li className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                      راه‌اندازی سریع و آسان
                    </li>
                    <li className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                      پشتیبانی ۲۴ ساعته
                    </li>
                    <li className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                      قیمت مناسب و مقرون به صرفه
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <a
                    href={`tel:${teamInfo.phone}`}
                    className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">تماس با ما</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== دعوت به اقدام ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">آماده شروع همکاری هستیم</h2>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              برای مشاوره و راه‌اندازی سرویس بازو در ساختمان خود، با ما تماس
              بگیرید
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`tel:${teamInfo.phone}`}
                className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white text-blue-700 px-8 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{teamInfo.phone}</span>
              </a>

              <Link
                href="/"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-400 transition-colors"
              >
                <Building className="w-5 h-5" />
                <span>بازگشت به صفحه اصلی</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* ===== فوتر ===== */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Building className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">بازو</span>
              </div>
              <p className="text-gray-400">مدیریت هوشمند ساختمان در بستر بله</p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                توسعه‌یافته توسط {teamInfo.name}
              </p>
              <a
                href={`tel:${teamInfo.phone}`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {teamInfo.phone}
              </a>
              <p className="text-sm text-gray-500 mt-2">
                © {new Date().getFullYear()} - تمامی حقوق محفوظ است
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
