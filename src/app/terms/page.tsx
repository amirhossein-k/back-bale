// app/terms/page.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useBaleWebApp } from "@/hooks/useBaleWebApp";

export default function TermsPage() {
  const { expandMiniApp } = useBaleWebApp();

  useEffect(() => {
    expandMiniApp();
  }, []);

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
            مقررات استفاده از خدمات بازو
          </h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 max-w-5xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 mb-6 text-center"
          >
            قوانین و مقررات استفاده از پلتفرم بازو
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="space-y-6 text-gray-700 leading-relaxed text-lg"
          >
            <p>
              <strong>مقدمه:</strong>
              <br />
              به پلتفرم بازو خوش آمدید. این توافق‌نامه ("توافق‌نامه") شرایط و
              ضوابط استفاده شما از خدمات ما ("خدمات") را که توسط تیم مارلو
              ("ما"، "شرکت") ارائه می‌شود، مشخص می‌کند. لطفاً قبل از استفاده از
              خدمات، این توافق‌نامه را به دقت مطالعه فرمایید. دسترسی و استفاده
              شما از خدمات منوط به پذیرش و رعایت این توافق‌نامه است.
            </p>

            <div>
              <strong>1. پذیرش شرایط:</strong>
              <p className="mt-2">
                با دسترسی یا استفاده از خدمات ما، شما موافقت می‌کنید که به این
                توافق‌نامه، سیاست حفظ حریم خصوصی ما و هرگونه دستورالعمل اضافی،
                سیاست یا قوانین اصلاحی که ممکن است به طور دوره‌ای منتشر کنیم،
                پایبند باشید. اگر با هر بخشی از این شرایط موافق نیستید، لطفاً از
                خدمات ما استفاده نکنید.
              </p>
            </div>

            <div>
              <strong>2. شرح خدمات:</strong>
              <p className="mt-2">
                بازو یک پلتفرم نرم‌افزاری است که برای کمک به مدیریت ساختمان‌ها
                طراحی شده است. خدمات ما شامل ارائه پنل مدیریت، ابزارهای
                اطلاع‌رسانی، تسهیل پرداخت شارژ و گزارش‌گیری مالی می‌باشد. ما حق
                داریم خدمات خود را در هر زمان، با یا بدون اطلاع قبلی، تغییر
                دهیم، تعلیق کنیم یا متوقف سازیم.
              </p>
            </div>

            <div>
              <strong>3. حساب کاربری و امنیت:</strong>
              <p className="mt-2">
                شما مسئول حفظ محرمانگی اطلاعات حساب خود، از جمله رمز عبور، و
                همچنین تمام فعالیت‌هایی هستید که تحت حساب شما انجام می‌شود. شما
                موافقت می‌کنید که هرگونه استفاده غیرمجاز از حساب خود را فوراً به
                ما اطلاع دهید.
              </p>
            </div>

            <div>
              <strong>4. پرداخت‌ها و اشتراک‌ها:</strong>
              <p className="mt-2">
                خدمات ما ممکن است مستلزم پرداخت هزینه اشتراک باشد. شما موافقت
                می‌کنید که تمام هزینه‌های مربوط به پلن اشتراک انتخابی خود را
                مطابق با قیمت‌های اعلام شده پرداخت نمایید. قیمت‌ها ممکن است
                تغییر کنند و ما حق داریم پلن‌ها یا قیمت‌ها را اصلاح کنیم.
              </p>
            </div>

            <div>
              <strong>5. مالکیت معنوی:</strong>
              <p className="mt-2">
                تمامی حقوق، عنوان و منافع مربوط به خدمات (شامل کلیه محتوای آن،
                نرم‌افزار، طرح‌ها، نام تجاری و لوگوها) متعلق به تیم مارلو است و
                تحت قوانین کپی‌رایت و سایر قوانین مالکیت معنوی محافظت می‌شود.
              </p>
            </div>

            <div>
              <strong>6. محدودیت‌ها:</strong>
              <p className="mt-2">
                شما موافقت می‌کنید که از خدمات ما به صورت غیرقانونی، یا به نحوی
                که به خدمات، شبکه یا کاربران ما آسیب برساند، سوء استفاده نکنید.
              </p>
            </div>

            {/* <div>
              <strong>۷. سلب مسئولیت:</strong>
              <p className="mt-2">
                خدمات ما "همانطور که هست" و "همانطور که در دسترس است" ارائه
                می‌شود. ما هیچ تضمینی در مورد دقت، قابلیت اطمینان یا در دسترس
                بودن خدمات ارائه نمی‌دهیم.
              </p>
            </div> */}

            <div>
              <strong>7. تغییرات در توافق‌نامه:</strong>
              <p className="mt-2">
                ما حق داریم هر زمان که صلاح بدانیم، این توافق‌نامه را اصلاح یا
                جایگزین کنیم. ما تلاش خواهیم کرد تا اطلاع‌رسانی معقولی در مورد
                تغییرات ارائه دهیم. ادامه استفاده شما از خدمات پس از اجرای
                تغییرات به منزله پذیرش آن تغییرات است.
              </p>
            </div>

            <div>
              <strong>8. قوانین حاکم:</strong>
              <p className="mt-2">
                این توافق‌نامه تابع قوانین ایران خواهد بود و مطابق با آن تفسیر
                خواهد شد.
              </p>
            </div>

            <div>
              <strong>9. تماس با ما:</strong>
              <p className="mt-2">
                اگر در مورد این توافق‌نامه سؤالی دارید، لطفاً با ما تماس بگیرید.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                آخرین به‌روزرسانی: {new Date().toLocaleDateString("fa-IR")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
