// src/lib/queryConfig/telegram/createQueryConfig.ts
import { UseQueryOptions } from '@tanstack/react-query';
import { getStatusUser, getUser } from './Req';
import type { StatusResponse } from './Req';

// نوع کوئری‌های پشتیبانی شده
export type UserStatusQueryKey = 'userFetch' | 'userModelFetch';

// نوع پارامترهای ورودی
interface QueryConfigOptions {
    userId?: number;
}

export type UserModelResponse = Awaited<ReturnType<typeof getUser>>




// تابع تولید config
export const getQueryConfigUser =
    <TQueryFnData = StatusResponse | UserModelResponse,
        TError = Error,
        TData = TQueryFnData>({
            queryType,
            options,
        }: {
            queryType: UserStatusQueryKey;
            options: QueryConfigOptions;
        }): UseQueryOptions<TQueryFnData, TError, TData, [UserStatusQueryKey, number?]> => {
        const { userId } = options;

        // اعتبارسنجی userId برای کوئری‌هایی که نیاز دارند
        const isUserIdValid = userId !== undefined;

        switch (queryType) {
            case 'userFetch':
                return {
                    queryKey: ['userFetch', userId],   // شامل userId برای کش مجزا
                    queryFn: () => getStatusUser(userId!) as Promise<TQueryFnData>,
                    enabled: isUserIdValid,
                    staleTime: 1000 * 60 * 5,
                } as UseQueryOptions<TQueryFnData, TError, TData, [UserStatusQueryKey, number?]>;
            case 'userModelFetch':
                return {
                    queryKey: ['userModelFetch', userId],
                    queryFn: () => getUser(userId!) as Promise<TQueryFnData>,
                    enabled: isUserIdValid,
                    staleTime: 1000 * 60 * 5,
                } as UseQueryOptions<TQueryFnData, TError, TData, [UserStatusQueryKey, number?]>;
            default:
                throw new Error(`Unknown query type: ${queryType}`);
        }
    };