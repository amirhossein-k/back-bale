// src/components/BaleMiniApp.tsx
"use client";

import { useBaleWebApp } from "@/hooks/useBaleWebApp";
import LoadingState from "@/components/BaleUI/LoadingState";
import ValidationErrorState from "@/components/BaleUI/ValidationError";
import ValidatingState from "@/components/BaleUI/ValidatingState";
import ValidatedContent from "@/components/BaleUI/ValidatedContent";

export default function BaleMiniApp() {
  const {
    isSDKReady,
    userInfo,
    isValidated,
    validationError,
    isIframe,
    openInvoice,
    close,
  } = useBaleWebApp();

  // ---------- Render ----------
  if (!isSDKReady) return <LoadingState />;
  if (validationError)
    return <ValidationErrorState message={validationError} />;
  if (!isValidated) return <ValidatingState />;
  if (!userInfo) return <p>No user data available</p>;
  console.log(close, "close");

  return (
    <ValidatedContent
      user={userInfo}
      isIframe={isIframe}
      openInvoice={openInvoice}
      closes={close}
    />
  );
}
