import { getUserQuery } from "@/app/api/telegram/user/get/route";
import { AvailableGroupsResponse, BotGroup } from "@/types/bale";

//src\lib\queryConfig\telegram\Req.ts
export interface BuildingInfo {        // ← export
    id: string;
    name: string;
    address?: string;
}
export interface BildingInfo {        // ← export
    _id: any;
    managerId: any;
    chatIdGroup: number;
}
export interface StatusResponse {       // ← export
    role: "user" | "manager" | "none" | "modir";
    buildings: BuildingInfo[];
    bilding?: BildingInfo[];
    mongoUserId: any
}

export async function getStatusUser(userId: number): Promise<StatusResponse> {
    console.log('getStoryMain')
    const res = await fetch(`/api/telegram/user/status`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
            // credentials: "include", // اگر نیاز به کوکی دارید
        });

    if (!res.ok) {
        throw new Error("خطا در دریافت استوری ها");
    }

    return res.json();
}
export async function getUser(userId: number): Promise<getUserQuery> {
    console.log('getUser')
    const res = await fetch(`/api/telegram/user/get`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
            // credentials: "include", // اگر نیاز به کوکی دارید
        });

    if (!res.ok) {
        throw new Error("خطا در دریافت استوری ها");
    }

    return res.json();
}


/**
 * دریافت گروه‌های قابل ارسال برای یک مدیر ساختمان
 */
export async function getAvailableGroups(buildingId: string, userId: string): Promise<BotGroup[]> {
    const res = await fetch(
        `/api/telegram/building/${buildingId}/available-groups?userId=${userId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'خطا در دریافت گروه‌های موجود');
    }

    const data: AvailableGroupsResponse = await res.json();

    // API فعلی گاهی null بر می‌گرداند، فیلتر می‌کنیم
    return (data.groups || []).filter((g: BotGroup | null) => g !== null);
}