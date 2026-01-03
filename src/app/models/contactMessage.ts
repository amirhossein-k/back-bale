import mongoose, { Schema, Document, Model } from "mongoose";

// --------------- TypeScript Interface ---------------
export interface IContactMessage extends Document {
       userId?: string; // اختیاری – از Bale user
       name: string;
       email: string;
       subject: string;
       message: string;
       createdAt: Date;
       readAt?: Date | null; // برای مدیریت ادمین
}

// --------------- Mongoose Schema ---------------
const ContactMessageSchema = new Schema<IContactMessage>(
       {
              userId: {
                     type: String,
                     default: null,
              },
              name: {
                     type: String,
                     required: [true, "نام الزامی است"],
                     trim: true,
                     minlength: [2, "نام حداقل ۲ کاراکتر باید باشد"],
                     maxlength: [100, "نام حداکثر ۱۰۰ کاراکتر"],
              },
              email: {
                     type: String,
                     required: [true, "ایمیل الزامی است"],
                     trim: true,
                     lowercase: true,
                     match: [
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            "لطفاً یک ایمیل معتبر وارد کنید",
                     ],
              },
              subject: {
                     type: String,
                     required: [true, "موضوع پیام الزامی است"],
                     trim: true,
                     minlength: [3, "موضوع حداقل ۳ کاراکتر"],
                     maxlength: [200, "موضوع حداکثر ۲۰۰ کاراکتر"],
              },
              message: {
                     type: String,
                     required: [true, "متن پیام الزامی است"],
                     trim: true,
                     minlength: [10, "پیام حداقل ۱۰ کاراکتر"],
                     maxlength: [2000, "پیام حداکثر ۲۰۰۰ کاراکتر"],
              },
              readAt: {
                     type: Date,
                     default: null,
              },
       },
       {
              timestamps: { createdAt: "createdAt", updatedAt: false },
              collection: "contact_messages",
       }
);

// --------------- Model (از cache موجود استفاده می‌کند) ---------------
const ContactMessage: Model<IContactMessage> =
       mongoose.models.ContactMessage ||
       mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
