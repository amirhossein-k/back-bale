import crypto from "crypto";

export function generateActivationCode() {
  // ترکیبی از timestamp + رندم هگز برای تضمین یکتایی
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  const code = `MARLOO-${timestamp}-${random}`;
  return code;
}
