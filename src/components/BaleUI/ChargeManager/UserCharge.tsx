// components/user/UserCharge.tsx
import React, { useState, useEffect } from "react";

const UserCharge = ({
  buildingId,
  userId,
}: {
  buildingId: string;
  userId: number;
}) => {
  const [myPayments, setMyPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUploadReceipt = async () => {
    // این تابع توسط ربات فراخوانی می‌شود
    // در مینی‌اپ هم می‌توانید این قابلیت را اضافه کنید
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("receiptImage", file);
      formData.append("userId", userId.toString());
      formData.append("buildingId", buildingId);

      // ارسال به API
      const res = await fetch("/api/charges/receipt", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ رسید با موفقیت ارسال شد");
      }
    };
    input.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">وضعیت شارژ من</h2>

      <div className="space-y-4">
        {[1, 2, 3].map((month) => (
          <div key={month} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                {/* <span className="font-bold">{monthNames[month]}</span> */}
                <span className="text-gray-500 mr-2">۱۴۰۴</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  month < 3
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {month < 3 ? "پرداخت شده" : "پرداخت نشده"}
              </span>
            </div>
            {month >= 3 && (
              <button
                onClick={handleUploadReceipt}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                📤 ارسال رسید پرداخت
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
