// app/contact/page.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  BotMessageSquare,
} from "lucide-react";
import { useEffect } from "react";
// import { useBaleWebApp } from "@/hooks/useBaleWebApp";
import { useContactForm } from "@/hooks/useContactForm";
import toast from "react-hot-toast";

export default function ContactPage() {
  // const { expandMiniApp } = useBaleWebApp();
  const {
    formData,
    updateField,
    handleSubmit,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    responseMessage,
    resetForm,
  } = useContactForm();

  useEffect(() => {
    // پاک کردن toast قبلی
    toast.dismiss("contact-toast");

    if (isLoading) {
      toast.loading("لطفاً صبر کنید...", { id: "contact-toast" });
    } else if (isSuccess) {
      toast.success("✅ پیام شما با موفقیت ارسال شد!", {
        id: "contact-toast",
        duration: 3000,
      });
      // تاخیر برای ریست فرم
      setTimeout(() => {
        resetForm();
      }, 100);
    } else if (isError) {
      toast.error(errorMessage || "❌ خطا در ارسال پیام", {
        id: "contact-toast",
        duration: 4000,
      });
    }
  }, [isLoading, isSuccess, isError, errorMessage]); // ✅ resetForm حذف شد

  // useEffect(() => {
  //   expandMiniApp();
  // }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as const;

  const contactInfo = {
    address: `تهران، خیابان پیروزی`,
    phone: "۰۹۳۹۱۴۷۰۴۲۷",
    email: "info@marloo.shop",
    website: "marloo.shop",
    workingHours: "شنبه تا چهارشنبه: ۹:۰۰ - ۱۸:۰۰ | پنجشنبه: ۹:۰۰ - ۱۳:۰۰",
  };

  const socialLinks = [
    {
      name: "پیامرسان بله",
      icon: BotMessageSquare,
      href: "https://ble.ir/hamyarmarloobot",
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
  ];

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--bale-bg-color, #f9fafb)" }}
    >
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link
            href="/"
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">صفحه اصلی</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            تماس با ما
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* ===== اطلاعات تماس ===== */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              <span className="text-blue-600">با ما</span> در تماس باشید
            </h2>

            <div className="space-y-8">
              {/* آدرس */}
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                  <MapPin className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    آدرس
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              {/* تلفن */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
                  <Phone className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    تلفن
                  </p>
                  <p className="text-xl font-bold text-blue-600 ltr" dir="ltr">
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </p>
                </div>
              </div>

              {/* ایمیل */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                  <Mail className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    ایمیل
                  </p>
                  <p className="text-lg text-blue-600 font-medium">
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="hover:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* وبسایت */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                  <Globe className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    وبسایت
                  </p>
                  <p className="text-lg text-blue-600 font-medium">
                    <a
                      href={`https://${contactInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {contactInfo.website}
                    </a>
                  </p>
                </div>
              </div>

              {/* ساعات کاری */}
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                  <Clock className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    ساعات کاری
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {contactInfo.workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* شبکه‌های اجتماعی */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-lg font-semibold text-gray-900 mb-4 text-center">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </p>
              <div className="flex justify-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 ${social.bg} rounded-2xl ${social.color} hover:scale-110 transition-transform duration-200 shadow-sm`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== فرم تماس ===== */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ارسال <span className="text-blue-600">پیام</span>
            </h2>
            <p className="text-gray-500 mb-8">
              سوال، پیشنهاد یا انتقاد خود را با ما در میان بگذارید.
            </p>

            {/* ✅ اصلاح: onSubmit به handleSubmit تغییر کرد */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* نام */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  id="name"
                  // ✅ اضافه شد
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                  placeholder="مثال: علی محمدی"
                />
              </div>

              {/* ایمیل */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  آدرس ایمیل
                </label>
                <input
                  type="email"
                  id="email"
                  // ✅ اضافه شد
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                  placeholder="example@email.com"
                />
              </div>

              {/* موضوع */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  موضوع
                </label>
                <select
                  id="subject"
                  // ✅ اضافه شد
                  value={formData.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                >
                  <option value="">انتخاب کنید...</option>
                  <option value="support">پشتیبانی فنی</option>
                  <option value="suggestion">پیشنهاد</option>
                  <option value="complaint">انتقاد</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              {/* پیام */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  پیام شما
                </label>
                <textarea
                  id="message"
                  rows={5}
                  // ✅ اضافه شد
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 resize-none"
                  placeholder="متن پیام خود را بنویسید..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading} // ✅ غیرفعال در حالت لودینگ
                className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </main>

      {/* ===== فوتر ساده ===== */}
      <footer className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm border-t border-gray-200">
        <p>© {new Date().getFullYear()} تیم مارلو | تمامی حقوق محفوظ است.</p>
      </footer>
    </div>
  );
}
