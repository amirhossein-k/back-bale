// src\utils\plan.ts
import { Plan } from "@/types/pay";
import {
  Building,
  Bell,
  CreditCard,
  BarChart3,
  CheckCircle,
  Shield,
  Zap,
  Users,
  Calendar,
  Home,
  Info,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
export // ===== پلن‌های قیمت‌گذاری =====
const pricingPlans: Plan[] = [
  {
    id: "monthly",
    name: "ماهانه",
    price: 10000,
    period: "تومان / ماه",
    description: "",
    features: [
      "مدیریت حرفه ای",
      "اطلاعیه ها",
      "گزارش‌های پایه",
      "پرداخت سریع و اسان شارژ",
      "پشتیبانی 24 ساعته",
    ],
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: "quarterly",
    name: "سه‌ماهه",
    price: 850000,
    period: "تومان / سه‌ماهه",
    description: "",
    features: [
      "مدیریت حرفه ای",
      "اطلاعیه ها",
      "گزارش‌های پایه",
      "پرداخت سریع و اسان شارژ",
      "پشتیبانی 24 ساعته",
    ],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    id: "yearly",
    name: "سالانه",
    price: 4000000,
    period: "تومان / سال",
    description: "",
    features: [
      "مدیریت حرفه ای",
      "اطلاعیه ها",
      "گزارش‌های پایه",
      "پرداخت سریع و اسان شارژ",
      "پشتیبانی 24 ساعته",
    ],
    icon: <Zap className="w-6 h-6" />,
  },
];
