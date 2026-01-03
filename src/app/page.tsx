"use client";

import dynamic from "next/dynamic";
import LoadingState from "@/components/BaleUI/LoadingState";

const BaleHome = dynamic(() => import("@/components/BaleUI/BaleHome"), {
  ssr: false,
  loading: () => <LoadingState />,
});

export default function Home() {
  return <BaleHome />;
}
