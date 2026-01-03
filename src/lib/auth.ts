// lib/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt, { compare } from "bcryptjs";
import { Otp } from "@/app/models/Otp";
import User from "@/app/models/User";
import Purchase from "@/app/models/Purchase";
// import { generateCode } from "./helper";


// تولید کد یکتای کاربر (codeYekta)
export function generateCodeYekta(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
export function generateIDUSER(): number {
    return Date.now() + Math.floor(Math.random() * 10000);
}
export const authOptions: AuthOptions = {
    session: { strategy: "jwt", maxAge: 30 * 60, },
    jwt: {
        maxAge: 30 * 60, // 30 دقیقه برای توکن JWT
    },
    providers: [
        CredentialsProvider({
            id: "otp-login",
            name: "OTP-LOGIN",
            credentials: {
                phoneNumber: { label: "شماره موبایل", type: "text" },
                otp: { label: "کد تأیید", type: "text" },
                baleUser: { label: "اطلاعات کاربر بله", type: "text" },

            },
            async authorize(credentials) {
                const MAX_ATTEMPTS = 5; // حداکثر تلاش مجاز

                console.log(credentials?.otp, 'otpppppppp')
                console.log(credentials?.phoneNumber, 'pjondnumnber')
                if (!credentials?.phoneNumber || !credentials?.otp) {
                    throw new Error("شماره موبایل و کد تأیید الزامی است");
                }
                console.error('otppppppppeeeeeeeeeeee')
                console.dir('otppppppppeeeeeeeeeeee')

                // 1. دریافت یا تولید telegramId
                let telegramId: number;
                if (credentials.baleUser) {
                    const parsed = parseInt(credentials.baleUser, 10);
                    telegramId = (!isNaN(parsed) && parsed > 0) ? parsed : generateIDUSER();
                } else {
                    telegramId = generateIDUSER();
                }

                console.log(telegramId, 'telegramId')

                const otpRecord = await Otp.findOne({
                    phoneNumber: credentials.phoneNumber,
                }); if (!otpRecord) {
                    throw new Error("کد تأیید ارسال نشده است");
                }

                // 2. بررسی انقضا
                if (new Date() > otpRecord.expiresAt) {
                    await Otp.deleteMany({
                        phoneNumber: credentials.phoneNumber,
                    });
                    throw new Error("کد تأیید منقضی شده است");
                }

                // 3. ✅ مقایسه OTP با bcrypt
                const isValid = await compare(credentials.otp, otpRecord.code);
                if (!isValid) {
                    throw new Error("کد تأیید نادرست است");
                }
                const idUSer = otpRecord._id.toString()
                // 4. پاک کردن OTP مصرف شده
                await Otp.deleteMany({ phoneNumber: credentials.phoneNumber });

                console.log(credentials.phoneNumber, 'credentials.phoneNumber')
                let purchase = await Purchase.findOne({ phoneNumber: credentials.phoneNumber, status: 'pending' });
                let finalCodeYekta: string;

                // let userFind = await User.findOne({ phoneNumber: credentials.phoneNumber })
                let userFind = await User.findOne({ telegramId })

                if (
                    !userFind
                ) {
                    try {
                        userFind = await User.create({
                            phoneNumber: credentials.phoneNumber,
                            telegramId
                        })
                    } catch (error) {
                        throw new Error("خطا در ثبت اطلاعات کاربر");

                    }
                }
                if (!purchase) {
                    finalCodeYekta = generateCodeYekta();
                    try {
                        purchase = await Purchase.create({
                            phoneNumber: credentials.phoneNumber,
                            codeYekta: finalCodeYekta,
                            userId: userFind._id,
                        });
                        console.log("✅ Purchase created:", purchase);
                    } catch (err) {
                        console.error("❌ Error creating Purchase:", err);
                        throw new Error("خطا در ثبت اطلاعات کاربر");
                    }
                } else {
                    finalCodeYekta = purchase.codeYekta;
                    console.log("✅ Purchase already exists, using existing codeYekta:", finalCodeYekta);
                }
                const user = {
                    id: userFind._id.toString(),
                    phoneNumber: credentials.phoneNumber,
                    codeYekta: finalCodeYekta,

                }
                console.log("🟢 Returning user from authorize:", user);

                return user
            },
        }),
    ],
    callbacks: {
        // JWT فقط اطلاعات سبک
        async jwt({ token, user }) {
            console.log("🟢 JWT callback called");
            console.log("User from authorize:", user);

            if (user) {
                token.user = {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    codeYekta: user.codeYekta,

                };
                console.log("✅ Token updated:", token.user);

            }
            return token;
        },
        // اگر می‌خواهید همیشه آخرین وضعیت کاربر از دیتابیس خوانده شود (و نه فقط اطلاعات ذخیره شده در زمان لاگین)، باید در فایل کانفیگ next-auth، در بخش callbacks از session استفاده کنید تا فیلد admin را در لحظه از دیتابیس بگیرید:


        // Session.lazy-load
        async session({ session, token }) {
            console.log("🟢 Session callback called");
            console.log("Token user:", token.user);

            if (token.user) {
                session.user = {
                    ...session.user,
                    id: token.user.id,
                    phoneNumber: token.user.phoneNumber,
                    codeYekta: token.user.codeYekta,
                };
            }
            return session;

        },

    },
    pages: {
        signIn: "/login",

    },
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "none",    // چون در iframe هستیم
                path: "/",
                secure: true,        // چون HTTPS است
                domain: ".marloo.shop", // اختیاری، برای دسترسی در ساب‌دامین‌ها
                maxAge: 30 * 60, // 30 دقیقه

            }
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 30 * 60, // 30 دقیقه

            }
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 30 * 60, // 30 دقیقه

            }
        }
    },
};