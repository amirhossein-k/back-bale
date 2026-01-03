// src/app/Providers.tsx
"use client";
// import { ThemeProvider as NextThemesProvider } from "next-themes";
import { persistor, store } from "@/store";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/ClientThemeProvider";

// ✅ بارگذاری داینامیک NextThemesProvider بدون SSR
const NextThemesProvider = dynamic(
  () => import("next-themes").then((mod) => mod.ThemeProvider),
  { ssr: false },
);
export default function Providers({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // در کلاینت، کل Providerهای وابسته به window را رندر کن
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            {dehydratedState ? (
              <HydrationBoundary state={dehydratedState}>
                <ThemeProvider>{children}</ThemeProvider>
              </HydrationBoundary>
            ) : (
              <ThemeProvider>{children}</ThemeProvider>
            )}
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
