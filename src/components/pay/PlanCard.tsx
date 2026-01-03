"use client";

import { Plan } from "@/types/pay";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
// import type { Plan } from "@/types/pay";

// --- PropTypes ---
interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (plan: Plan) => void;
  index: number;
}

// =============================================

export default function PlanCard({
  plan,
  isSelected,
  onSelect,
  index,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={() => onSelect(plan)}
      className={`
        relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-200"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(plan);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`انتخاب پلن ${plan.name} با قیمت ${plan.price} تومان`}
    >
      {/* نشان ویژه */}
      {plan.icon && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`
            absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold text-white
           
          `}
        >
          {plan.icon}
        </motion.span>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
      <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

      <div className="mb-4">
        <span className="text-3xl font-bold text-blue-600">
          {plan.price.toLocaleString("fa-IR")}
        </span>
        <span className="text-gray-500 mr-1">تومان</span>
      </div>

      <div className="text-sm text-gray-500 mb-4">{plan.period}</div>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature: string, idx: number) => (
          <li
            key={idx}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-2 text-blue-600 font-semibold"
        >
          <span>✓ انتخاب شده</span>
        </motion.div>
      )}
    </motion.div>
  );
}
