import { dbConnect } from "@/app/api/mongodb";
import User from "@/app/models/User";
import crypto from "crypto";

export async function validateInitData(initData: any) {
  await dbConnect();

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");
  const checkString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (calculatedHash !== hash) return null;

  const userStr = params.get("user");
  if (!userStr) return null;

  const userObj = JSON.parse(userStr);
  const telegramId = userObj.id;

  const user = await User.findOne({ telegramId });
  if (!user) return null;

  return {
    userId: user._id.toString(),
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    },
  };
}
