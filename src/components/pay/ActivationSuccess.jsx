"use client";

import { motion } from "framer-motion";
import { FaCheckCircle, FaTelegramPlane, FaCopy } from "react-icons/fa";
import { useState } from "react";

export default function ActivationSuccess({
  activationCode,
  planName,
  phoneNumber,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = activationCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const baleBotUrl = `https://bale.ai/Bot/${process.env.NEXT_PUBLIC_BALE_BOT_USERNAME}?start=${activationCode}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center"
    >
      {/* انیمیشن موفقیت */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-4" />
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🎉 پرداخت با موفقیت انجام شد!
      </h2>
      <p className="text-gray-500 mb-1">
        پلن <strong>{planName}</strong>
      </p>
      <p className="text-gray-500 mb-6">شماره تماس: {phoneNumber}</p>

      {/* کد فعالسازی */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
        <p className="text-sm text-gray-500 mb-2">کد فعالسازی شما:</p>
        <motion.div
          className="flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-xl font-mono font-bold text-blue-700 tracking-wider dir-ltr">
            {activationCode}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
            title="کپی کد"
          >
            {copied ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-500 text-sm"
              >
                ✓ کپی شد
              </motion.span>
            ) : (
              <FaCopy className="text-blue-500" />
            )}
          </button>
        </motion.div>
      </div>

      {/* دکمه هدایت به بله */}
      <motion.a
        href={baleBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-3 bg-[#2D9CDB] text-white px-8 py-4 rounded-xl 
                   font-semibold text-lg shadow-lg hover:bg-[#2389C4] transition-all"
      >
        <FaTelegramPlane className="text-2xl" />
        <span>دریافت فعالسازی در بله</span>
      </motion.a>

      <p className="text-xs text-gray-400 mt-4">
        با کلیک روی دکمه بالا، به ربات بله هدایت می‌شوید
      </p>
    </motion.div>
  );
}
