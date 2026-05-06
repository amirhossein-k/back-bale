"use client";

import { useState, useCallback, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  CheckCheckIcon,
  CheckIcon,
  CircleDollarSignIcon,
  MagnetIcon,
  PlusIcon,
  UserIcon,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import toast from "react-hot-toast";
import { getPersianMonthName, MONTHS } from "@/hooks/database";

// ---------- Types ----------
type ModalType = "charge" | "electricity" | "water" | "facilities" | "extra";
interface Member {
  _id: string;
  userId: {
    _id: string;
    telegramId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
  };
  role: "admin" | "member";
  joinedAt: string;
}
interface ModalConfig {
  key: ModalType;
  title: string;
  icon: string; // یا می‌توان از کامپوننت مجزا استفاده کرد
  apiTitle: string; // برای ارسال به API
}
interface ChargeFormData {
  buildingId: string;
  title: string;
  month: string;
  year: number;
  totalAmount: number;
  dueDate: string; // ISO string
  targetMember: string[];
}

const MODALS: ModalConfig[] = [
  { key: "charge", title: "ثبت شارژ ماهیانه", icon: "💰", apiTitle: "charge" },
  {
    key: "electricity",
    title: "ثبت برق ساختمان",
    icon: "⚡",
    apiTitle: "electricity",
  },
  { key: "water", title: "ثبت آب ساختمان", icon: "💧", apiTitle: "water" },
  {
    key: "facilities",
    title: "ثبت هزینه امکانات",
    icon: "🏢",
    apiTitle: "Facilities",
  },
  { key: "extra", title: "ثبت هزینه‌های اضافی", icon: "📋", apiTitle: "extra" },
];
// ---------- API Call ----------
async function submitCharge(data: ChargeFormData) {
  const response = await fetch("/api/telegram/charges/monthly", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "خطا در ارسال اطلاعات");
  }

  return response.json();
}
// ---------- تابع کمکی برای استخراج نام کامل ----------
function getFullName(member: Member): string {
  const { firstName, lastName } = member.userId;
  return [firstName, lastName].filter(Boolean).join(" ") || "بی‌نام";
}
// ---------- تابع کمکی برای استخراج شناسه نمایشی ----------
function getDisplayId(member: Member): string {
  const { telegramId, username, phone } = member.userId;
  // استفاده از ?? و String() برای اطمینان از خروجی رشته‌ای
  const value = telegramId ?? username ?? phone;
  return value !== null && value !== undefined ? String(value) : "—";
}

// ---------- Modal Component ----------
function Modal({
  config,

  onClose,
}: {
  config: ModalConfig;

  onClose: () => void;
}) {
  const { buildingId, userId } = useSelector(
    (state: RootState) => state.dataBale,
  );
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ChargeFormData>({
    buildingId: buildingId || "",
    title: config.apiTitle,
    month: "far",
    year: new Date().getFullYear(),
    totalAmount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 روز بعد
    targetMember: [], // لیست telegramId ها
  });
  //   const [memberInput, setMemberInput] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // جستجو
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // ── دریافت اعضا ─────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!buildingId) return;
    setLoadingMembers(true);
    setErrorMembers("");
    try {
      const res = await fetch(`/api/telegram/building/${buildingId}/members`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setMembers(data.members || []);
    } catch (e: any) {
      setErrorMembers(e.message || "خطا در دریافت اعضا");
    } finally {
      setLoadingMembers(false);
    }
  }, [buildingId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // همگام‌سازی selectedMemberIds با formData.targetMember
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetMember: selectedMemberIds,
    }));
  }, [selectedMemberIds]);

  // ارسال فرم
  const mutation = useMutation({
    mutationFn: submitCharge,
    onSuccess: () => {
      toast.success(`${config.title} با موفقیت ثبت شد!`);
      queryClient.invalidateQueries({ queryKey: ["monthly-charges"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`خطا: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی
    if (!formData.buildingId.trim()) {
      alert("لطفاً شناسه ساختمان را وارد کنید");
      return;
    }

    if (formData.totalAmount <= 0) {
      alert("مبلغ باید بزرگتر از صفر باشد");
      return;
    }

    mutation.mutate(formData);
  };

  // انتخاب/لغو انتخاب عضو
  //   const toggleMemberSelection = (telegramId: string) => {
  //     setFormData((prev) => {
  //       const isSelected = prev.targetMember.includes(telegramId);
  //       if (isSelected) {
  //         return {
  //           ...prev,
  //           targetMember: prev.targetMember.filter((id) => id !== telegramId),
  //         };
  //       } else {
  //         return {
  //           ...prev,
  //           targetMember: [...prev.targetMember, telegramId],
  //         };
  //       }
  //     });
  //   };
  // انتخاب/لغو انتخاب یک عضو
  const toggleMemberSelection = (telegramId: string) => {
    setFormData((prev) => {
      const isSelected = prev.targetMember.includes(telegramId);
      if (isSelected) {
        return {
          ...prev,
          targetMember: prev.targetMember.filter((id) => id !== telegramId),
        };
      } else {
        return {
          ...prev,
          targetMember: [...prev.targetMember, telegramId],
        };
      }
    });
  };

  // انتخاب همه اعضا
  //   const selectAllMembers = () => {
  //     const allTelegramIds = members
  //       .map((member) => member.userId?.telegramId)
  //       .filter(Boolean) as string[];
  //     setFormData((prev) => ({
  //       ...prev,
  //       targetMember: allTelegramIds,
  //     }));
  //   };
  const selectAllMembers = () => {
    const allIds = members
      .filter((m) => m.userId?.telegramId)
      .map((m) => m.userId.telegramId!);
    setFormData((prev) => ({ ...prev, targetMember: allIds }));
  };
  // لغو انتخاب همه
  //   const deselectAllMembers = () => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       targetMember: [],
  //     }));
  //   };

  const deselectAllMembers = () => {
    setFormData((prev) => ({ ...prev, targetMember: [] }));
  };

  // فیلتر اعضا بر اساس جستجو
  const filteredMembers = members.filter((member) => {
    const fullName = getFullName(member).toLowerCase();
    const displayId = String(getDisplayId(member)).toLowerCase();
    const phone = member.userId?.phone
      ? String(member.userId.phone).toLowerCase()
      : "";
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      displayId.includes(search) ||
      phone.includes(search)
    );
  });

  //   const handleAddMember = () => {
  //     if (
  //       memberInput.trim() &&
  //       !formData.targetMember.includes(memberInput.trim())
  //     ) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         targetMember: [...prev.targetMember, memberInput.trim()],
  //       }));
  //       setMemberInput("");
  //     }
  //   };
  //   const handleRemoveMember = (memberId: string) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       targetMember: prev.targetMember.filter((id) => id !== memberId),
  //     }));
  //   };
  return (
    <motion.div
      key={config.key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg  dark:bg-gray-800 bg-[#1e2939] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="بستن"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <span className="text-4xl">{config.icon}</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {config.title}
          </h2>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ساختمان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
              شناسه ساختمان
            </label>
            <input
              type="text"
              disabled
              value={formData.buildingId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, buildingId: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: building_123"
              required
            />
          </div>

          {/* ماه و سال */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
                ماه
              </label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, month: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {getPersianMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
                سال
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                // min="1400"
                // max="1500"
                required
              />
            </div>
          </div>

          {/* مبلغ کل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
              مبلغ کل (تومان)
            </label>
            <div className="relative">
              <CircleDollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalAmount: parseFloat(e.target.value),
                  }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: 500000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          {/* تاریخ سررسید */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
              تاریخ سررسید
            </label>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* اعضای هدف */}
          <div
            className="flex flex-col gap-2 items-center justify-between mb-3 rounded-md overflow-hidden p-2"
            style={{ boxShadow: "0px 0px 5px 1px #4499f1" }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
              اعضای هدف (telegramId)
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllMembers}
                // disabled={members.length === 0}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                انتخاب همه
              </button>
              <button
                type="button"
                // disabled={formData.targetMember.length === 0}
                onClick={deselectAllMembers}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                لغو همه
              </button>
            </div>
            {/* جستجو */}
            <div className="mb-3 relative">
              <MagnetIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو بر اساس نام، نام کاربری یا شماره تلفن..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* لیست اعضا */}
            {/* لیست اعضا */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-60 overflow-y-auto">
              {loadingMembers ? (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    در حال دریافت اعضا...
                  </p>
                </div>
              ) : errorMembers ? (
                <div className="text-center py-4 text-red-600 dark:text-red-400">
                  <p>{errorMembers}</p>
                  <button
                    onClick={fetchMembers}
                    className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "هیچ عضوی با این مشخصات یافت نشد"
                    : "هیچ عضوی در این ساختمان وجود ندارد"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member) => {
                    const telegramId = member.userId?.telegramId;
                    const isSelected = telegramId
                      ? formData.targetMember.includes(telegramId)
                      : false;
                    return (
                      <div
                        key={member._id}
                        onClick={() => {
                          if (telegramId) toggleMemberSelection(telegramId);
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                            : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {getFullName(member)}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span>@{getDisplayId(member)}</span>
                              {member.userId?.phone && (
                                <span>• {member.userId.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              member.role === "admin"
                                ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            }`}
                          >
                            {member.role === "admin" ? "مدیر" : "عضو"}
                          </span>

                          {isSelected && (
                            <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* تعداد انتخاب شده */}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {formData.targetMember.length} عضو از {members.length} عضو انتخاب
              شده‌اند
            </div>
          </div>

          {/* دکمه‌های فرم */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={mutation.isPending}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : (
                "ذخیره"
              )}
            </button>
          </div>
        </form>

        {/* Placeholder for form content */}
        {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-right"> */}
        {/* <p className="text-gray-500 dark:text-gray-400">
            محتوای فرم مربوط به {config.title} در این بخش قرار می‌گیرد.
          </p> */}
        {/* </div> */}

        {/* Example action button */}
        {/* <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={() => alert(`ذخیره ${config.title}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
          >
            ذخیره
          </button>
        </div> */}
      </motion.div>
    </motion.div>
  );
}

// ---------- Main Component ----------
export default function RegisterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const currentModal = MODALS.find((m) => m.key === activeModal);

  const handleOpenModal = useCallback((key: ModalType) => {
    setActiveModal(key);
    setIsOpen(false); // بستن منو هنگام باز شدن مودال
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  return (
    <>
      {/* دکمه اصلی "ثبت" */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          <span>ثبت</span>
        </button>

        {/* Accordion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-40"
            >
              <div className="p-2 space-y-1">
                {MODALS.map((modal) => (
                  <button
                    key={modal.key}
                    onClick={() => handleOpenModal(modal.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <span className="text-2xl">{modal.icon}</span>
                    <span className="font-medium">{modal.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* مودال */}
      <AnimatePresence>
        {currentModal && (
          <Modal config={currentModal} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
}
