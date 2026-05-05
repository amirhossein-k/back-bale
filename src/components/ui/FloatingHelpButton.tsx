// components/FloatingHelpButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // بستن مودال با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* دکمه شناور */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90"
        aria-label="راهنما"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* مودال راهنما */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-40 flex items-end justify-center sm:items-center p-4"
          >
            {/* پس‌زمینه نیمه‌شفاف */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* محتوای مودال */}
            <motion.div
              ref={modalRef}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                📖 راهنمای استفاده از مینی‌اپ
              </h2>

              <div className="space-y-6">
                {/* بخش اتصال ربات به گروه */}
                <section>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    🤖 اتصال ربات به گروه ساختمان
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li>
                      ربات{" "}
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                        YourBot
                      </span>{" "}
                      را در گروه ساختمان خود
                      <strong> عضو کنید</strong>.
                    </li>
                    <li>
                      در گروه، به ربات <strong>تمام دسترسی‌ها</strong> (ارسال
                      پیام، حذف پیام، مدیریت و...) را بدهید.
                    </li>
                    <li>
                      در گروه، جمله زیر را تایپ کرده و ارسال کنید:
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-center">
                        <code className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                          AddGroup_1
                        </code>
                      </div>
                    </li>
                    <li>
                      ربات گروه را ذخیره می‌کند و از این پس می‌توانید از این
                      صفحه پیام‌های خود را به آن گروه ارسال کنید.
                    </li>
                  </ol>
                </section>

                {/* سایر بخش‌های راهنما */}
                <section>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    📝 ارسال پیام به گروه
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    پس از اتصال گروه، از فرم بالای همین صفحه گروه مورد نظر را
                    انتخاب کرده و پیام خود را بنویسید و دکمه "ارسال پیام" را
                    بزنید.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    🔐 مدیریت دسترسی‌ها
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    در پنل مدیریت ساختمان می‌توانید سایر مدیران را اضافه یا حذف
                    کنید و سطح دسترسی آنها را مشخص کنید.
                  </p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
