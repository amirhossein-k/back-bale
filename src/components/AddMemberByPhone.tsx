// components/AddMemberByPhone.tsx
import { useState } from "react";

interface Props {
  buildingId: string;
}

export default function AddMemberByPhone({ buildingId }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setMessage("");

    const initData = (window as any).Telegram?.WebApp?.initData;
    if (!initData) {
      setMessage("خطا: مینی‌اپ به درستی بارگذاری نشده.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/building/addMemberByPhone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          phoneNumber: phone.trim(),
          buildingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setPhone("");
      } else {
        setMessage(data.error || "خطا در افزودن عضو");
      }
    } catch (err) {
      setMessage("خطای شبکه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h3>افزودن عضو با شماره تلفن</h3>
      <input
        type="tel"
        placeholder="مثال: 09123456789"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
      <button onClick={handleAdd} disabled={loading}>
        {loading ? "در حال افزودن..." : "➕ افزودن عضو"}
      </button>
      {message && <p style={{ marginTop: "8px" }}>{message}</p>}
    </div>
  );
}
