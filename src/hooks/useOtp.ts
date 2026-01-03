/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useOtp.ts
import { signIn } from "next-auth/react";
import { useState, useCallback } from "react";

interface OtpState {
       step: "phone" | "otp" | "success" | "error";
       phoneNumber: string;
       loading: boolean;
       error: string | null;
       remainingSeconds: number;
       remainingAttempts: number;
}

export function useOtp() {
       const [state, setState] = useState<OtpState>({
              step: "phone",
              phoneNumber: "",
              loading: false,
              error: null,
              remainingSeconds: 0,
              remainingAttempts: 5,
       });

       const sendOtp = useCallback(async (phoneNumber: string) => {
              setState((prev) => ({ ...prev, loading: true, error: null }));

              try {
                     const res = await fetch("/api/auth/send-otp", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phoneNumber }),
                     });

                     const data = await res.json();

                     if (!res.ok) {
                            setState((prev) => ({
                                   ...prev,
                                   loading: false,
                                   error: data.error,
                                   remainingSeconds: data.remainingSeconds || 0,
                            }));
                            return false;
                     }

                     setState((prev) => ({
                            ...prev,
                            step: "otp",
                            phoneNumber,
                            loading: false,
                            error: null,
                     }));
                     return true;
              } catch (err: any) {
                     setState((prev) => ({
                            ...prev,
                            loading: false,
                            error: "خطا در اتصال به سرور",
                     }));
                     return false;
              }
       }, []);

       const verifyOtp = useCallback(
              async (code: string) => {
                     setState((prev) => ({ ...prev, loading: true, error: null }));
                     const getBaleUser = (): number | null => {
                            try {
                                   return window?.Bale?.WebApp?.initDataUnsafe?.user?.id ?? null;

                            } catch (e) {
                                   console.error("Error getting Bale user:", e);
                            }
                            return null;

                     };
                     const baleUserId: number | null = getBaleUser();
                     console.log(baleUserId, 'baleUserId')
                     try {
                            const res = await fetch("/api/auth/verify-otp", {
                                   method: "POST",
                                   headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({ phoneNumber: state.phoneNumber, code }),
                            });

                            const data = await res.json();

                            if (!res.ok) {
                                   setState((prev) => ({
                                          ...prev,
                                          loading: false,
                                          error: data.error,
                                          remainingAttempts: data.remainingAttempts ?? prev.remainingAttempts,
                                   }));
                                   return false;
                            }


                            console.log(state.phoneNumber, 'jijii')
                            console.log(code, 'jjijijioooooo')

                            const result = await signIn("otp-login", {
                                   redirect: false,
                                   phoneNumber: state.phoneNumber,
                                   otp: code,
                                   baleUser: baleUserId?.toString(),

                                   // callbackUrl: "/cart",


                            });
                            console.log("Full signIn response:", JSON.stringify(result, null, 2));
                            // await new Promise((resolve) => setTimeout(resolve, 5000));

                            console.log("signIn result:", result);
                            console.log("Error details:", result?.error);
                            if (result?.error) {
                                   setState((prev) => ({
                                          ...prev,
                                          loading: false,
                                          error: result.error,
                                          remainingAttempts: prev.remainingAttempts - 1,
                                   }));
                                   return false;
                            }

                            setState((prev) => ({
                                   ...prev,
                                   step: "success",
                                   loading: false,
                                   error: null,
                            }));
                            return true;
                     } catch (err: any) {
                            setState((prev) => ({
                                   ...prev,
                                   loading: false,
                                   error: "خطا در اتصال به سرور",
                            }));
                            return false;
                     }
              },
              [state.phoneNumber]
       );

       const reset = useCallback(() => {
              setState({
                     step: "phone",
                     phoneNumber: "",
                     loading: false,
                     error: null,
                     remainingSeconds: 0,
                     remainingAttempts: 5,
              });
       }, []);

       return { ...state, sendOtp, verifyOtp, reset };
}
