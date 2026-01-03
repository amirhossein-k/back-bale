// scripts/set-webhook.js
import axios from "axios";

async function setWebhook() {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEBHOOK_URL = "https://marloo.shop/api/telegram";

  try {
    const response = await axios.post(
      `https://tapi.bale.ai/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        max_connections: 40,
      },
    );

    console.log("✅ Webhook set successfully:", response.data);
  } catch (error) {
    console.error(
      "❌ Error setting webhook:",
      error.response?.data || error.message,
    );
  }
}

setWebhook();
