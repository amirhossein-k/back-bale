import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

// ------------------ تولید کد منحصربه‌فرد ------------------
function generateReferralCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// تلاش برای یافتن یک کد یکتا (در صورت برخورد با کلید تکراری)
async function getUniqueReferralCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  while (!isUnique) {
    code = generateReferralCode();
    const existing = await mongoose.models.User.findOne({ referralCode: code });
    if (!existing) isUnique = true;
  }
  return code!;
}

// ------------------ اینترفیس ------------------
export interface IUser extends Document {
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: 'none' | 'user' | 'admin' | 'modir';
  botState: 'idle' | 'awaiting_building_name' | 'awaiting_building_address' | 'awaiting_card';
  tempBuildingName?: string;
  tempBuildingId?: string;
  referralCode: string | null;
  phoneNumber: string | null           // ← امکان null
  referredBy: mongoose.Types.ObjectId | null;
  totalCommission: number;
  pendingCommission: number;
  createdAt: Date;
  updatedAt: Date;
  cardNumber?: string;       // شماره کارت
  sheba?: string;            // شماره شبا (اختیاری)
  fullName?: string;
  adressBuilding?: string
  nameBuilding?: string
  tempBuildingAddress?: string       // نام صاحب حساب
}

// referralCode: کد منحصربه‌فرد برای هر کاربر (مثلاً "u7f3a9").
// referredBy: کاربری که این کاربر را دعوت کرده است.
// totalCommission: کل کمیسیون دریافت‌شده.
// pendingCommission: کمیسیون هنوز تسویه‌نشده.

// ------------------ اسکیما ------------------
const UserSchema = new Schema<IUser>(
  {

    telegramId: { type: Number, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },// اسم متسعاری که مدیر میزارد
    username: { type: String },
    role: {
      type: String,
      enum: ['none', 'user', 'admin', 'modir'],
      default: 'none',
    },
    botState: {
      type: String,
      enum: ['idle', 'awaiting_building_name', 'awaiting_building_address', 'awaiting_card'],
      default: 'idle',
    },
    tempBuildingName: { type: String, default: undefined },
    tempBuildingId: { type: String, default: undefined },
    tempBuildingAddress: { type: String, default: undefined },
    adressBuilding: { type: String, default: undefined },
    nameBuilding: { type: String, default: undefined },
    // ─── فیلدهای ارجاع ───
    referralCode: { //کد دعوت
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    totalCommission: {
      type: Number,
      default: 0,
    },
    pendingCommission: {
      type: Number,
      default: 0,
    },
    cardNumber: { type: String },
    sheba: { type: String },
    fullName: { type: String },
    phoneNumber: {
      type: String, default: '', unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

// ─── پیش‌ذخیره (pre‑save) برای تولید خودکار کد ارجاع ───
UserSchema.pre('save', async function () {
  if (this.isNew && !this.referralCode) {
    const code = await getUniqueReferralCode();
    this.referralCode = `https://ble.ir/hamyarmarloobot?start=POR_${code}_${this._id}`
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
