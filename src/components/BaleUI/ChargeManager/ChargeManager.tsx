// components/admin/ChargeManager.tsx
import React, { useState, useEffect } from 'react';

interface MemberPayment {
  userId: number;
  fullName: string;
  unitNumber: string;
  hasPaid: boolean;
  payment?: {
    amount: number;
    paidAt: string;
    method: string;
    receiptImage?: string;
  };
}

const ChargeManager = ({ buildingId }: { buildingId: string }) => {
  const { userId, webApp } = useTelegram();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [members, setMembers] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [selectedMonth, selectedYear]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/charges/payments?buildingId=${buildingId}&month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      
      if (data.success) {
        setMembers(data.data);
        setPaidCount(data.data.filter((m: any) => m.hasPaid).length);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (userIds: number[]) => {
    if (!confirm('آیا از ارسال اخطار به این کاربران اطمینان دارید؟')) return;

    try {
      const res = await fetch('/api/charges/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeId: `${selectedYear}-${selectedMonth}`,
          userIds,
          buildingId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ اخطار با موفقیت ارسال شد');
      }
    } catch (error) {
      alert('❌ خطا در ارسال اخطار');
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    // باز کردن تصویر رسید در modal یا پنجره جدید
    if (webApp) {
      webApp.openLink(receiptUrl);
    } else {
      window.open(receiptUrl, '_blank');
    }
  };

  const unpaidMembers = members.filter(m => !m.hasPaid);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* هدر */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">مدیریت شارژ ساختمان</h2>
        
        {/* انتخاب ماه و سال */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleDateString('fa-IR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {[1403, 1404, 1405].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-600">تعداد کل واحدها</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          <div className="text-sm text-gray-600">پرداخت کرده</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{unpaidMembers.length}</div>
          <div className="text-sm text-gray-600">پرداخت نکرده</div>
        </div>
      </div>

      {/* لیست اعضا */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-right">واحد</th>
              <th className="p-2 text-right">نام</th>
              <th className="p-2 text-center">وضعیت</th>
              <th className="p-2 text-center">مبلغ</th>
              <th className="p-2 text-center">رسید</th>
              <th className="p-2 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.userId} className="border-b hover:bg-gray-50">
                <td className="p-2">{member.unitNumber}</td>
                <td className="p-2">{member.fullName}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.hasPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.hasPaid ? '✓ پرداخت شده' : '✗ پرداخت نشده'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  {member.payment?.amount 
                    ? member.payment.amount.toLocaleString() 
                    : '—'}
                </td>
                <td className="p-2 text-center">
                  {member.payment?.receiptImage && (
                    <button
                      onClick={() => handleViewReceipt(member.payment!.receiptImage!)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      مشاهده رسید
                    </button>
                  )}
                </td>
                <td className="p-2 text-center">
                  {!member.hasPaid && (
                    <button
                      onClick={() => handleSendReminder([member.userId])}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    >
                      ⚠️ ارسال اخطار
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* دکمه ارسال اخطار به همه */}
      {unpaidMembers.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => handleSendReminder(unpaidMembers.map(m => m.userId))}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            ⚠️ ارسال اخطار به تمام {unpaidMembers.length} واحدی که پرداخت نکرده‌اند
          </button>
        </div>
      )}
    </div>
  );
};

export default ChargeManager;
