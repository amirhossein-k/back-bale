"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DatePicker as JalaliDatePicker } from "react-jalali-picker";
import "react-jalali-picker/dist/styles.css";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns-jalali";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

interface PersianDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const dayjsValue = value ? dayjs(value) : null;

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // محاسبه موقعیت پاپ‌آپ نسبت به دکمه
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleChange = (date: dayjs.Dayjs | null) => {
    onChange(date ? date.toDate() : undefined);
    setIsOpen(false);
  };

  // بستن با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".jalali-date-picker-portal")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // موقعیت را هنگام اسکرول یا تغییر اندازه پنجره به‌روز کن
  useEffect(() => {
    if (!isOpen) return;
    const handleResizeOrScroll = () => updatePosition();
    window.addEventListener("scroll", handleResizeOrScroll, true);
    window.addEventListener("resize", handleResizeOrScroll);
    return () => {
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      window.removeEventListener("resize", handleResizeOrScroll);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", isMobile ? "w-full" : "w-auto")}>
      <Button
        ref={buttonRef}
        variant="outline"
        className={cn(
          "justify-start text-right font-normal",
          isMobile ? "w-full" : "w-[160px]",
          !value && "text-muted-foreground",
        )}
        onClick={handleOpen}
      >
        <CalendarIcon className="ml-2 h-4 w-4 text-black shrink-0" />
        <span className="truncate flex-1">
          {value ? format(value, "yyyy/MM/dd") : placeholder}
        </span>
      </Button>
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="jalali-date-picker-portal fixed z-[9999]"
            style={{ top: position.top - 170, left: position.left - 50 }}
          >
            <div className="bg-white rounded-md shadow-lg overflow-x-auto">
              <div
                className="min-w-[280px] w-max"
                style={{
                  transform: "scale(0.85)",
                  transformOrigin: "top right",
                }}
              >
                <JalaliDatePicker
                  value={dayjsValue}
                  onChange={handleChange}
                  locale="fa"
                  calendarType="jalali"
                  direction="rtl"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
