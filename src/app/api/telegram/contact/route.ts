import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../mongodb";
import ContactMessage from "@/app/models/contactMessage";

// --------------- Validation ---------------
interface ContactFormData {
       name: string;
       email: string;
       subject: string;
       message: string;
}

function validateContactData(data: any): {
       valid: boolean;
       errors: string[];
       sanitized: ContactFormData | null;
} {
       const errors: string[] = [];
       if (!data || typeof data !== "object") {
              return { valid: false, errors: ["داده‌ای ارسال نشده است"], sanitized: null };
       }

       const name = typeof data.name === "string" ? data.name.trim() : "";
       const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
       const subject = typeof data.subject === "string" ? data.subject.trim() : "";
       const message = typeof data.message === "string" ? data.message.trim() : "";

       if (!name || name.length < 2 || name.length > 100)
              errors.push("نام باید بین ۲ تا ۱۰۰ کاراکتر باشد");
       if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              errors.push("ایمیل معتبر وارد کنید");
       if (!subject || subject.length < 3 || subject.length > 200)
              errors.push("موضوع باید بین ۳ تا ۲۰۰ کاراکتر باشد");
       if (!message || message.length < 10 || message.length > 2000)
              errors.push("پیام باید بین ۱۰ تا ۲۰۰۰ کاراکتر باشد");

       if (errors.length > 0) {
              return { valid: false, errors, sanitized: null };
       }

       return {
              valid: true,
              errors: [],
              sanitized: { name, email, subject, message },
       };
}

// --------------- POST Handler ---------------
export async function POST(request: NextRequest) {
       try {
              const body = await request.json();
              const { valid, errors, sanitized } = validateContactData(body);

              if (!valid || !sanitized) {
                     return NextResponse.json(
                            { ok: false, errors },
                            { status: 400 }
                     );
              }

              // (اختیاری) دریافت userId از هدر یا session (بسته به پیاده‌سازی احراز هویت)
              const userId = request.headers.get("x-bale-user-id") || undefined;

              // اتصال به دیتابیس (با استفاده از تابع dbConnect موجود پروژه)
              await dbConnect();

              const contactMessage = await ContactMessage.create({
                     userId,
                     ...sanitized,
              });

              return NextResponse.json(
                     {
                            ok: true,
                            message: "پیام شما با موفقیت ثبت شد",
                            data: {
                                   id: contactMessage._id,
                                   createdAt: contactMessage.createdAt,
                            },
                     },
                     { status: 201 }
              );
       } catch (error: any) {
              console.error("Contact API Error:", error);
              return NextResponse.json(
                     { ok: false, errors: ["خطای سرور، لطفاً بعداً تلاش کنید"] },
                     { status: 500 }
              );
       }
}
