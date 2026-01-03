// src/app/dashboard/layout.tsx
"use client";

import Script from "next/script";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
