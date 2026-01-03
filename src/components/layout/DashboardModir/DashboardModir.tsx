// components/DashboardAdmin.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import FloatingHelpButton from "@/components/ui/FloatingHelpButton";
import toast from "react-hot-toast";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import ChargeList from "@/components/BaleUI/ChargeManager/UserCharge";
import WalletManager from "@/components/BaleUI/Modir/WalletManager/WalletManager";

const TOKEN = "WALLET-LZMGcUwl4yNP2IUc";
const TOKEN2 = "WALLET-TEST-1111111111111111";

export default function DashboardModir() {
  const { userId, bildingsId } = useSelector(
    (state: RootState) => state.dataBale,
  );
  const [openWallets, setOpenWallets] = useState(false);

  const handleToggleWallets = useCallback((state: boolean) => {
    setOpenWallets(state);
  }, []);
  console.log(window.Bale, "ffffff");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="w-full"
    >
      {/* دکمه راهنما */}
      <FloatingHelpButton />
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-linear-to-l from-indigo-600 to-purple-600 px-5 py-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <motion.span
            className="inline-block text-2xl"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🏢
          </motion.span>
          <div>
            <h2 className="text-lg font-bold">پنل مدیریت بازو</h2>
            {/* <p className="text-xs text-white/70">مدیریت ساختمان شما</p> */}
          </div>
        </div>
      </div>

      {/* ── محتوای داشبورد ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl gap-1.5 flex flex-col bg-white p-5 shadow-sm ring-1 ring-gray-100 bg-linear-to-l from-indigo-600 to-purple-600 px-5 py-4 text-white "
        >
          {/* کیف پول مدیر های ساختمان   ──────────────────────────── */}

          <motion.button
            onClick={() => handleToggleWallets(!openWallets)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <motion.span
              animate={{ rotate: openWallets ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block text-lg"
            ></motion.span>
            {openWallets ? "بستن" : "کیف پول مدیر های ساختمان"}
          </motion.button>
        </motion.div>
      </AnimatePresence>
      {/* ── شارژ ماهیانه────────────────────────────── */}
      <AnimatePresence>
        {openWallets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => handleToggleWallets(false)}
          >
            <motion.div
              key="gapmessage-modal"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-md"
            >
              <WalletManager
                bildingsId={bildingsId}
                userId={userId}
                // onClose={() => handleToggleListUser(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
