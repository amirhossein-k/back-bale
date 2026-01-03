"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface ContactFormValues {
       name: string;
       email: string;
       subject: string;
       message: string;
}

interface SubmitResponse {
       ok: boolean;
       message: string;
       errors?: string[];
}

async function submitContact(data: ContactFormValues): Promise<SubmitResponse> {
       const response = await fetch("/api/telegram/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
       });

       const result = await response.json();

       if (!response.ok) {
              throw new Error(result.errors?.join("، ") || "خطا در ارسال پیام");
       }

       return result;
}

export function useContactForm() {
       const [formData, setFormData] = useState<ContactFormValues>({
              name: "",
              email: "",
              subject: "",
              message: "",
       });

       const mutation = useMutation<SubmitResponse, Error, ContactFormValues>({
              mutationFn: submitContact,
       });

       const updateField = (field: keyof ContactFormValues, value: string) => {
              setFormData((prev) => ({ ...prev, [field]: value }));
       };

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault();
              // اعتبارسنجی ساده سمت کلاینت
              if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                     // می‌توانید از توست یا状态 محلی استفاده کنید
                     return;
              }
              mutation.mutate(formData);
       };

       const resetForm = () => {
              setFormData({ name: "", email: "", subject: "", message: "" });
       };

       return {
              formData,
              updateField,
              handleSubmit,
              resetForm,
              isLoading: mutation.isPending,
              isSuccess: mutation.isSuccess,
              isError: mutation.isError,
              errorMessage: mutation.error?.message || null,
              responseMessage: mutation.data?.message || null,
       };
}
