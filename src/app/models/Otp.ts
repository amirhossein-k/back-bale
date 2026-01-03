// src/models/Otp.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
       phoneNumber: string;
       code: string;
       attempts: number;
       expiresAt: Date;
       createdAt: Date;
       codeYekta: string
}

const OtpSchema = new Schema<IOtp>({
       phoneNumber: {
              type: String,
              required: true,
              index: true,
       },
       code: {
              type: String,
              required: true,
       },
       attempts: {
              type: Number,
              default: 0,
              max: 5, // حداکثر ۵ تلاش
       },
       expiresAt: {
              type: Date,
              required: true,
              index: { expires: 0 }, // TTL: مونگو خودکار بعد از انقضا پاک می‌کند
       },
       createdAt: {
              type: Date,
              default: Date.now,
       },
       codeYekta: {
              type: String
       }
});

export const Otp: Model<IOtp> =
       mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
