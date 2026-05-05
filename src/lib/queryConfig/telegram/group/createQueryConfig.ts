// src/lib/queryConfig/telegram/group/createQueryConfig.ts

import { BotGroup } from '@/types/bale';
import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { getAvailableGroups } from '../Req';


// ─── تنظیمات ورودی ──────────────────────────────
interface AvailableGroupsOptions {
    buildingId?: any;
    userId?: any;
}

// ─── نوع QueryKey ────────────────────────────────
type AvailableGroupsKey = ["availableGroups", string, string]; // [queryName, buildingId, userId]

// ─── تابع تولید تنظیمات ───────────────────────────
export const getQueryConfigAvailableGroups = ({
    options,
}: {
    options: AvailableGroupsOptions;
}): UseQueryOptions<BotGroup[], Error, BotGroup[], AvailableGroupsKey> => {
    const { buildingId, userId } = options;

    return {
        queryKey: ["availableGroups", buildingId!, userId!],
        queryFn: () => getAvailableGroups(buildingId!, userId!),
        enabled: !!buildingId && !!userId,
        staleTime: 1000 * 60 * 5, // 5 دقیقه
        retry: 2,
    };
};
