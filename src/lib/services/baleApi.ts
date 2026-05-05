// src/services/baleApi.ts

export interface ValidationResponse {
    ok: boolean;
    userStr?: any;
    error?: string;
}

/**
 * ارسال initData به بک‌اند برای اعتبارسنجی
 */
export async function validateInitData(
    initData: string
): Promise<ValidationResponse> {
    const response = await fetch("/api/telegram/validateminiapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
    });

    return response.json();
}
