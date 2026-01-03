// src\actions\auth\send-otp.ts
'use server'

import { ApiResponse } from "@/types/pay";

interface OtpState {
       step: "phone" | "otp" | "success" | "error";
       phoneNumber: string;
       loading: boolean;
       error: string | null;
       remainingSeconds: number;
       remainingAttempts: number;
}
interface SendOTPResponse extends ApiResponse<OtpState> {
       error: boolean

}
export async function sendOtpAction(phoneNumber: string) {

       try {

              const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-otp`, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ phoneNumber }),
              });

              const data = await res.json();

              if (!res.ok) {

                     return {

                            success: false, message: 'خطا در ارسال کد', error: false,
                            remainingSeconds: data.remainingSeconds || 0,

                     };
              }

              return {

                     success: true, message: "کد ارسال شد", error: false,
              }

       } catch (error: any) {
              console.error("Error in sendOtpAction:", error);
              return {

                     success: false,
                     message: "خطا در ارسال کد. لطفا دوباره تلاش کنید.",
                     error: true,
              };
       }


}
