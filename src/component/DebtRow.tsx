"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ChevronDown, ChevronUp, AlertTriangle, RotateCcw, FileText } from "lucide-react";
import { AccountDto, LegalFileDto } from "@/types/debt";
import { useDebt } from "@/context/DebtContext";

function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Normal Hesap Satırı ─────────────────────────────────────────────────────

interface AccountRowProps {
  account: AccountDto;
  tckn: string;
  index: number;
}

export function AccountRow({ account, tckn, index }: AccountRowProps) {
  const { openPaymentModal, openRefundModal } = useDebt();
  const [expanded, setExpanded] = useState(false);

  const hasDebt       = account.currentDebt > 0;
  const hasHolding    = account.currentHolding > 0;
  const hasChangeOrder = account.hasChangeOrder ?? false;
  // Sadece 0'dan büyük tutarlı ve CLOSED olmayan faturalar
  const payableInvoices = account.invoices.filter(
    (inv) => inv.amount > 0 && inv.status !== "CLOSED"
  );
  const hasInvoices = payableInvoices.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:bg-white/[0.13] transition-all duration-200"
    >
      {/* Ana satır */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-white/40 shrink-0" />
              <p className="text-white/50 text-xs font-mono">Hesap No: {account.accountId}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasDebt && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-1.5 inline-block">
                  <p className="text-red-300 text-xs font-medium">Borç</p>
                  <p className="text-white font-bold text-base">{formatTL(account.currentDebt)}</p>
                </div>
              )}
              {hasHolding && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg px-3 py-1.5 inline-block">
                  <p className="text-green-300 text-xs font-medium">Alacak</p>
                  <p className="text-white font-bold text-base">{formatTL(account.currentHolding)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasHolding && (
              <motion.button
                whileHover={hasChangeOrder ? {} : { scale: 1.04 }}
                whileTap={hasChangeOrder ? {} : { scale: 0.96 }}
                onClick={() => !hasChangeOrder && openRefundModal({ type: "account", action: "refund", account, tckn })}
                disabled={hasChangeOrder}
                title={hasChangeOrder ? "İade talebiniz işleme alınmıştır. En geç 5 iş günü içinde hesabınıza yatırılacaktır." : undefined}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  hasChangeOrder
                    ? "bg-gray-600 cursor-not-allowed opacity-60"
                    : "bg-green-700 hover:bg-green-600 text-white"
                }`}
              >
                <RotateCcw size={12} />
                İade Et
              </motion.button>
            )}
            {hasDebt && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => openPaymentModal({ type: "account", action: "pay", account, tckn })}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                <CreditCard size={12} />
                Öde
              </motion.button>
            )}
            {hasInvoices && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {account.invoices.length} Fatura
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fatura listesi — borçta Öde, alacakta İade Et */}
      <AnimatePresence>
        {expanded && hasInvoices && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="px-5 py-3 space-y-1 bg-black/10">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Faturalar</p>
              {payableInvoices.map((inv) => (
                <div
                  key={inv.invoiceNumber}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 gap-4"
                >
                  <div className="flex-1">
                    <p className="text-white/70 text-xs font-mono">{inv.invoiceNumber}</p>
                    {inv.expiryDate && !hasHolding && (
                      <p className="text-white/40 text-xs mt-0.5">Son ödeme: {formatDate(inv.expiryDate)}</p>
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm shrink-0">{formatTL(inv.amount)}</p>

                  {hasDebt && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openPaymentModal({ type: "account", action: "pay", account, tckn, invoice: inv })}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      <CreditCard size={12} />
                      Öde
                    </motion.button>
                  )}

                  {hasHolding && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openRefundModal({ type: "account", action: "refund", account, tckn, invoice: inv })}
                      className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      <RotateCcw size={12} />
                      İade Et
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Yasal Takip Dosyası Satırı (YTS) ────────────────────────────────────────

interface LegalFileRowProps {
  file: LegalFileDto;
  tckn: string;
  index: number;
}

export function LegalFileRow({ file, tckn, index }: LegalFileRowProps) {
  const { openPaymentModal, openRefundModal } = useDebt();

  const hasDebt    = file.totalDebt > 0;
  const hasHolding = file.totalHolding > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white/10 backdrop-blur-md border border-orange-400/30 rounded-xl p-5 hover:bg-white/[0.13] transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-400 shrink-0" />
            <span className="text-orange-300 text-xs font-semibold uppercase tracking-wider">Yasal Takip (YTS)</span>
            {file.hasChangeOrder && (
              <span className="text-xs bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-2 py-0.5 rounded-full">
                Değişim Emri
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-white/50 text-xs font-mono">Dosya No: {file.fileNumber}</p>
            {file.coNumber && <p className="text-white/40 text-xs">| CO: {file.coNumber}</p>}
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            {hasDebt && (
              <div className="bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-1.5">
                <p className="text-red-300 text-xs font-medium">Borç</p>
                <p className="text-white font-bold text-base">{formatTL(file.totalDebt)}</p>
              </div>
            )}
            {hasHolding && (
              <div className="bg-green-500/10 border border-green-400/20 rounded-lg px-3 py-1.5">
                <p className="text-green-300 text-xs font-medium">Alacak</p>
                <p className="text-white font-bold text-base">{formatTL(file.totalHolding)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasHolding && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openRefundModal({ type: "legal", action: "refund", file, tckn })}
              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-green-700/20"
            >
              <RotateCcw size={14} />
              İade Et
            </motion.button>
          )}

          {hasDebt && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openPaymentModal({ type: "legal", action: "pay", file, tckn })}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-orange-600/20"
            >
              <CreditCard size={14} />
              Öde
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
