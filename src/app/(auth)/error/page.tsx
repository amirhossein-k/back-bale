"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    "شماره موبایل و کد تأیید الزامی است":
      "لطفاً شماره موبایل و کد را وارد کنید",
    "کد تأیید ارسال نشده است": "ابتدا کد تأیید را دریافت کنید",
    "کد تأیید منقضی شده است": "کد تأیید منقضی شده، دوباره تلاش کنید",
    "کد تأیید نادرست است": "کد تأیید اشتباه است",
    CredentialsSignin: "اطلاعات ورود نادرست است",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">خطا در ورود</h1>
      <p className="text-gray-700 mb-4">
        {errorMessages[error || ""] || error || "خطای ناشناخته"}
      </p>
      <Link href="/login" className="text-blue-600 underline">
        بازگشت به صفحه ورود
      </Link>
    </div>
  );
}
