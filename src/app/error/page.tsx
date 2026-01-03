// app/error/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ErrorPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">خطا</h1>
        <p className="text-gray-600 mb-6">
          مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
        </p>
        <button
          onClick={() => router.back()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
        >
          بازگشت
        </button>
      </motion.div>
    </div>
  );
}
