"use client";
import axios from "axios";
import Link from "next/link";
// const BOT_TOKEN = process.env.BOT_TOKEN!;
const TestCharge2 = ({ BOT_TOKEN }: { BOT_TOKEN: any }) => {
  const API_URL = `https://tapi.bale.ai/bot${BOT_TOKEN}/sendInvoice`;
  const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
  console.log(BOT_TOKEN, "bottoken");
  const handleSend = async () => {
    const chatId = 360594256;
    try {
      const payload = `order_${chatId}_${Date.now()}`;
      const invoiceData = {
        // chat_id: chatId,
        title: "خرید پلن A",
        description:
          "پلن مدیریت A با داشبورد نمایش ساختمان + اعلان از طریق کانال ساختمان",
        payload,
        provider_token: TOKEN,
        // currency: 'IRR',
        prices: [
          // برچسب خدمت یا کالا
          { label: "پلن ویژه", amount: 20000 }, // ۵۰,۰۰۰ ریال
        ],
        // پارامترهای اختیاری:
        // start_parameter: 'buy_plane',
        // need_name: true,
        // need_phone_number: true,
        // need_email: false,
        // is_flexible: false,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();
      console.log(result, "resulr");
    } catch (error) {
      console.log(error, "errorr");
    }
  };
  return (
    <div>
      <Link href={"/dashboard&page=test1"}>test1</Link>
      <button type="button" onClick={() => handleSend()}>
        پرداخت
      </button>
    </div>
  );
};

export default TestCharge2;
