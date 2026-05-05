// src/types/bale.ts
export interface WebAppOpenInvoiceParams {
    invoiceParams: string;
}

export interface WebAppOpenLinkOptions {
    /** اگر true باشد، لینک در مرورگر داخلی بله باز می‌شود */
    try_instant_view?: boolean;
}

export type WebAppEvent =
    | "activated"
    | "deactivated"
    | "backButtonClicked"
    | "mainButtonClicked"
    | "settingsButtonClicked"
    | "invoiceClosed"
    | "popupClosed"
    | "viewportChanged"
    | "themeChanged"
    | "writeAccessRequested"
    | "contactRequested"
    | "qrTextReceived"
    | "scanQrFinished"
    | "clipboardTextReceived";
// تابعی که به عنوان handler برای رویدادها ثبت می‌شود

export type EventHandler = (...args: any[]) => void;

export interface BaleUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}
// --------------- WebApp اصلی ---------------

export interface BaleWebApp {
    initData?: string;
    initDataUnsafe?: {
        query_id?: string;
        auth_date?: string;
        hash?: string;

        user?: BaleUser;
    };
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: Record<string, string>;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    isIframe: boolean;

    // متدهای ضروری هوک
    ready: () => void;
    expand: () => void;
    close: () => void;
    sendData: (data: string) => void;

    setHeaderColor: (color: string) => void;
    enableClosingConfirmation: () => void;
    // متدهای invoice / link / events
    openInvoice: (
        params: WebAppOpenInvoiceParams,
        callback?: (status: string) => void
    ) => void;
    openLink: (url: string, options?: WebAppOpenLinkOptions) => void;
    onEvent: (eventType: WebAppEvent, eventHandler: EventHandler) => void;
    offEvent: (eventType: WebAppEvent, eventHandler: EventHandler) => void;
}

export interface BaleReceiveEvent {
    openInvoice: (
        invoiceParams: string, // معمولاً لینک فاکتور (invoice link)
        callback?: (status: string) => void
    ) => void;
    // متدهای رویداد دیگر در صورت نیاز
}

// declare global {
//     interface Window {
//         Bale?: {
//             WebApp?: BaleWebApp;
//             receiveEvent?: BaleReceiveEvent;
//         };
//     }
// }

declare global {
    interface Window {
        Bale?: any
    }
}

/** وضعیت کلی مینی‌اپ */
export interface BaleAppState {
    isSDKReady: boolean;
    userInfo: BaleUser | null;
    isIframe: boolean;
    isValidated: boolean;
    validationError: string | null;
    // 

    isSDKInitialized?: boolean;

    openInvoice?: (
        link: string,
        callback?: (status: string) => void
    ) => void; // ← فقط در DEV_FALLBACK وجود دارد
}

export interface BotGroup {
    _id?: string;
    chatId: number;
    title: string;
    type?: string;
}

export interface AvailableGroupsResponse {
    groups: BotGroup[];
}

// --------------- (اختیاری) BaleReceiveEvent ---------------
// اگر بخواهید بعداً openInvoice را به receiveEvent منتقل کنید:
// export interface BaleReceiveEvent {
//   openInvoice: (
//     url: string,
//     callback: (status: "paid" | "failed" | "pending") => void
//   ) => void;
// }