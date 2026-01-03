"use client";

import { useBaleWebApp } from "@/hooks/useBaleWebApp";
import LoadingState from "@/components/BaleUI/LoadingState";
import ValidatingState from "@/components/BaleUI/ValidatingState";
import ValidationErrorState from "@/components/BaleUI/ValidationError";
import BaleCheck from "@/components/BaleUI/BaleCheck";

export default function BaleHome() {
  const { isSDKReady, userInfo, isValidated, validationError, isIframe } =
    useBaleWebApp();

  if (!isSDKReady) return <LoadingState />;
  if (validationError)
    return <ValidationErrorState message={validationError} />;
  if (!isValidated) return <ValidatingState />;
  if (!userInfo) return <p>اطلاعات کاربر یافت نشد</p>;
  if (!isIframe && !userInfo?.id) {
    return (
      <div className="text-black">
        این برنامه فقط در پیام‌رسان بله قابل استفاده است.
      </div>
    );
  }
  return <BaleCheck user={userInfo} isIframe={isIframe} />;
}
