// src\lib\queryConfig\telegram\createQueryConfig.ts
import { useQuery, UseQueryResult, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { getStatusUser } from './Req';

import type { StatusResponse } from './Req'; // تایپ خروجی getStatusUser

// ─── تنظیمات ورودی ──────────────────────────────
interface QueryConfigOptions {
    userId?: number; // ← string باشد، چون getStatusUser string می‌گیرد
}
// ─── نوع QueryKey (برای caching) ─────────────────
type UserStatusQueryKey = ["userFetch"];

// ─── تابع تولید config برای React Query ──────────
// تابعی که تنظیمات useQuery را بر اساس نوع ورودی برمی‌گرداند
export const getQueryConfigUser = ({
    queryType,
    options,
}: {
    queryType: 'userFetch'; // انواع کوئری‌های ممکن

    options: QueryConfigOptions;
}): UseQueryOptions<StatusResponse, Error, StatusResponse, UserStatusQueryKey> => {

    const { userId } = options;

    switch (queryType) {
        case 'userFetch':
            return {
                queryKey: ["userFetch"], //closeId = type Modal Open => BLOG | PRODUCT
                queryFn: () => getStatusUser(userId!),
                enabled: !!userId,                     // ← فقط وقتی userId هست اجرا شود
                staleTime: 1000 * 60 * 5,
            };

        // case 'other':
        //   return {
        //     queryKey: ["some-other-key", supplierId, currentPage],
        //     queryFn: () => getSomeOtherData(supplierId, currentPage),
        //     enabled: !!supplierId,
        //     staleTime: 1000 * 60 * 5,
        //   };
        default:
            throw new Error(`Unknown query type: ${queryType}`);
    }
};