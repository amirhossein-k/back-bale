// src/hooks/useBaleWebApp.ts
// هوک سفارشی (قلب منطق) - نسخه اصلاح‌شده

import { useEffect, useReducer, useCallback, useRef } from "react";
import { BaleAppState, BaleUser, BaleWebApp, EventHandler, WebAppEvent, WebAppOpenInvoiceParams, WebAppOpenLinkOptions } from "@/types/bale";
import { BALE_CONSTANTS, DEV_FALLBACK_USER } from "@/constants/bale";
import { validateInitData } from "@/lib/services/baleApi";


// --------------- Action Types ---------------
type Action =
    | { type: "SDK_READY" }
    | { type: "SET_USER"; payload: BaleUser }
    | { type: "SET_IFRAME"; payload: boolean }
    | { type: "VALIDATION_SUCCESS"; payload: any }
    | { type: "VALIDATION_ERROR"; payload: string }
    | { type: "DEV_FALLBACK" }
    | { type: "SET_SDK_INITIALIZED"; payload: boolean }
// | { type: "SET_OPEN_INVOICE"; payload: (link: string, callback?: (status: string) => void) => void }; };

// --------------- Initial State ---------------
const initialState: BaleAppState & { isSDKInitialized: boolean } = {
    isSDKReady: false,
    userInfo: null,
    isIframe: false,
    isValidated: false,
    validationError: null,
    isSDKInitialized: false, // اضافه کردن فیلد جدید
    // openInvoice: () => { }
};

// --------------- Reducer ---------------
function reducer(state: BaleAppState & { isSDKInitialized: boolean }, action: Action): BaleAppState & { isSDKInitialized: boolean } {
    switch (action.type) {
        case "SDK_READY":
            return { ...state, isSDKReady: true };
        case "SET_USER":
            return { ...state, userInfo: action.payload };
        case "SET_IFRAME":
            return { ...state, isIframe: action.payload };
        case "VALIDATION_SUCCESS":
            return {
                ...state,
                isValidated: true,
                userInfo: action.payload,
                validationError: null,
            };
        case "VALIDATION_ERROR":
            return {
                ...state,
                isValidated: false,
                validationError: action.payload,
            };
        case "DEV_FALLBACK":
            return {
                ...state,
                isSDKReady: true,
                userInfo: DEV_FALLBACK_USER,
                isIframe: false,
                isValidated: true,
                validationError: null,
                isSDKInitialized: true,


            };
        case "SET_SDK_INITIALIZED":
            return { ...state, isSDKInitialized: action.payload };

        default:
            return state;
    }
}

// --------------- Helper Functions (خالص) ---------------

function applySDKSettings(webApp: BaleWebApp) {
    // فقط ready() را فراخوانی کن، expand() را به بعد موکول کن
    webApp.ready?.();
    webApp.expand?.();

    // تنظیم رنگ هدر
    webApp.setHeaderColor?.(BALE_CONSTANTS.HEADER_COLOR);

    // تنظیم رنگ پس‌زمینه
    document.documentElement.style.setProperty(
        "--bale-bg-color",
        BALE_CONSTANTS.BG_COLOR
    );

    console.log("✅ Bale SDK settings applied (ready called)");
}

// --------------- Hook ---------------
export function useBaleWebApp() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const hasCalledExpand = useRef(false); // برای جلوگیری از فراخوانی تکراری expand
    const baleWebAppRef = useRef<BaleWebApp | null>(null);
    const eventListeners = useRef<Map<WebAppEvent, EventHandler[]>>(new Map());

    // ========== اعتبارسنجی ==========

    const handleValidation = useCallback(async (webApp: BaleWebApp) => {
        const initData = webApp.initData;

        if (!initData) {
            console.warn("initData is empty — skipping validation");
            dispatch({ type: "VALIDATION_SUCCESS", payload: webApp.initDataUnsafe?.user });
            return;
        }

        try {
            const result = await validateInitData(initData);
            if (result.ok) {
                dispatch({ type: "VALIDATION_SUCCESS", payload: result.userStr });
            } else {
                dispatch({ type: "VALIDATION_ERROR", payload: result.error || "Invalid data" });
            }
        } catch (err: any) {
            dispatch({ type: "VALIDATION_ERROR", payload: err.message });
        }
    }, []);

    // ========== مقداردهی اولیه SDK ==========

    const initSDK = useCallback(
        (webApp: BaleWebApp) => {
            baleWebAppRef.current = webApp; // ذخیره رفرنس SDK

            // 1. تنظیمات اولیه (بدون expand)
            applySDKSettings(webApp);

            // 2. به‌روزرسانی state
            dispatch({ type: "SDK_READY" });
            dispatch({ type: "SET_IFRAME", payload: webApp.isIframe });
            dispatch({ type: "SET_SDK_INITIALIZED", payload: true });

            const user = webApp.initDataUnsafe?.user;
            if (user) {
                dispatch({ type: "SET_USER", payload: user });
            }

            // 3. اعتبارسنجی
            handleValidation(webApp);
            // ثبت event listenerهای موجود در نقشه
            // ثبت event listenerهای موجود در نقشه
            eventListeners.current.forEach((handlers, eventType) => {
                handlers.forEach((handler) => {
                    webApp.onEvent?.(eventType, handler);
                });
            });

            console.log("✅ Bale SDK initialized successfully");
        },
        [handleValidation]
    );

    // ========== expandMiniApp ==========
    // تابع برای فراخوانی expand با تاخیر
    const expandMiniApp = useCallback(() => {
        const webApp = baleWebAppRef.current;

        if (!webApp || hasCalledExpand.current) {
            return false;
        }

        try {
            // تاخیر کوچک برای اطمینان از آمادگی کامل SDK
            setTimeout(() => {
                // if (window.Bale?.WebApp) {
                webApp.expand?.();
                hasCalledExpand.current = true;
                console.log("✅ Mini app expanded successfully");
                // }
            }, 300); // 300ms تاخیر برای اطمینان
            return true;
        } catch (error) {
            console.error("❌ Error expanding mini app:", error);
            return false;
        }
    }, []);
    // ========== 3️⃣ onEvent ==========
    const onEvent = useCallback(
        (eventType: WebAppEvent, eventHandler: EventHandler) => {
            const listeners = eventListeners.current;
            if (!listeners.has(eventType)) {
                listeners.set(eventType, []);
            }
            listeners.get(eventType)?.push(eventHandler);

            // اگر SDK مقداردهی شده بود، مستقیم ثبت کن
            const webApp = baleWebAppRef.current;
            if (webApp?.onEvent) {
                webApp.onEvent(eventType, eventHandler);
            }
        },
        []
    );
    // ========== 4️⃣ offEvent ==========
    const offEvent = useCallback(
        (eventType: WebAppEvent, eventHandler: EventHandler) => {
            const listeners = eventListeners.current;
            const handlers = listeners.get(eventType);
            if (handlers) {
                const index = handlers.indexOf(eventHandler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
                if (handlers.length === 0) {
                    listeners.delete(eventType);
                }
            }

            // اگر SDK مقداردهی شده بود، حذف کن
            const webApp = baleWebAppRef.current;
            if (webApp?.offEvent) {
                webApp.offEvent(eventType, eventHandler);
            }
        },
        []
    );
    // ========== 6️⃣ sendData ==========
    const sendData = useCallback((data: any) => {
        const webApp = baleWebAppRef.current;
        if (!webApp?.sendData) {
            console.warn(
                "Bale WebApp not ready or sendData method not available."
            );
            return;
        }

        // تبدیل به رشته JSON
        const dataString =
            typeof data === "string" ? data : JSON.stringify(data);

        // بررسی محدودیت حجم (4096 بایت)
        if (dataString.length > 4096) {
            console.error(
                `❌ Data size exceeds 4096 bytes limit. Current size: ${dataString.length} bytes.`
            );
            return;
        }

        // ⚠️ توجه: بعد از sendData مینی‌اپ بسته می‌شود
        webApp.sendData(dataString);
    }, []);

    // ========== useEffect ==========
    useEffect(() => {
        let isMounted = true;
        let fallbackTimeout: NodeJS.Timeout;
        let checkInterval: NodeJS.Timeout;
        let sdkReadyTimeout: NodeJS.Timeout;

        const safeInit = (webApp: BaleWebApp) => {
            if (!isMounted) return;

            // تاخیر اضافی برای اطمینان از آمادگی SDK
            sdkReadyTimeout = setTimeout(() => {
                initSDK(webApp);
            }, 100); // 100ms تاخیر برای جلوگیری از خطای activated event
        };

        // ---------- مسیر ۱: SDK هم‌اکنون وجود دارد ----------
        if (window.Bale?.WebApp) {
            safeInit(window.Bale.WebApp);
            return () => {
                isMounted = false;
                clearTimeout(sdkReadyTimeout);
            };
        }

        // ---------- مسیر ۲: منتظر SDK می‌مانیم ----------
        console.log("⏳ Waiting for Bale SDK...");

        const handleEvent = () => {
            if (window.Bale?.WebApp) {
                safeInit(window.Bale.WebApp);
                cleanup();
            }
        };

        window.addEventListener("bale-web-app-ready", handleEvent);

        // Polling: هر ۲۰۰ms چک می‌کند
        checkInterval = setInterval(() => {
            if (window.Bale?.WebApp) {
                safeInit(window.Bale.WebApp);
                cleanup();
            }
        }, BALE_CONSTANTS.CHECK_INTERVAL_MS);

        // Fallback: بعد از ۳ ثانیه SDK نداریم → حالت توسعه
        fallbackTimeout = setTimeout(() => {
            if (!window.Bale?.WebApp && isMounted) {
                console.warn("⚠️ Fallback after timeout — dev mode");
                dispatch({ type: "DEV_FALLBACK" });
                cleanup();
            }
        }, BALE_CONSTANTS.FALLBACK_TIMEOUT_MS);

        function cleanup() {
            window.removeEventListener("bale-web-app-ready", handleEvent);
            clearInterval(checkInterval);
            clearTimeout(fallbackTimeout);
            clearTimeout(sdkReadyTimeout);
        }

        return () => {
            isMounted = false;
            cleanup();



        };
    }, [initSDK]);
    // --------------- Return ---------------

    return {
        ...state,
        expandMiniApp, // اضافه کردن تابع expand به خروجی

        sendData,
    };
}


