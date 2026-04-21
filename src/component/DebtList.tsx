"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowLeft, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebt } from "@/context/DebtContext";
import { AccountRow, LegalFileRow } from "@/component/DebtRow";
import PaymentModal from "@/component/PaymentModal";
import RefundModal from "@/component/RefundModal";
import { CustomerQueryResponse } from "@/types/debt";

function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Mock data — backend hazır olunca kaldır
const MOCK_RESULT: CustomerQueryResponse = {
  fullName: "Ahmet Yılmaz",
  accountCount: 2,
  totalDebt: 2340.5,
  inLegalProc: true,
  encryptedTckn: "enc_12345678901",
  accounts: [
    {
      accountId: 1001,
      encryptedAccountId: "enc_1001",
      currentDebt: 1250.0,
      currentHolding: 0,
      invoices: [
        { invoiceNumber: "INV-2024-001", amount: 750.0, expiryDate: "2024-06-30" },
        { invoiceNumber: "INV-2024-002", amount: 500.0, expiryDate: "2024-07-15" },
      ],
    },
    {
      accountId: 1002,
      encryptedAccountId: "enc_1002",
      currentDebt: 0,
      currentHolding: 320.5,
      invoices: [
        { invoiceNumber: "INV-2024-003", amount: 320.5, expiryDate: "2024-05-01" },
      ],
    },
  ],
  legalFiles: [
    {
      fileNumber: "YTS-2024-0042",
      totalDebt: 1090.5,
      totalHolding: 0,
      coNumber: "CO-8821",
      hasChangeOrder: true,
      encryptedAccountCode: "enc_acc_042",
      accounts: [{ accountCode: "ACC-042" }],
    },
  ],
};

export default function DebtList() {
  const router = useRouter();
  const { queryResult, tckn, operationType, edevletAccountCode, clearAll } = useDebt();

  const result = queryResult ?? MOCK_RESULT;
  const activeTckn = tckn || "12345678901";

  const { fullName, totalDebt, inLegalProc, accounts, legalFiles } = result;

  // Borç/alacak/changeOrder yoksa gösterme — eski sistemle aynı mantık
  const baseAccounts = (accounts ?? []).filter(
    (a) => a.currentDebt > 0 || a.currentHolding > 0 || a.hasChangeOrder
  );

  // e-Devlet akışında operationType'a göre filtrele
  const visibleAccounts = (() => {
    if (operationType === "PAYMENT" && edevletAccountCode) {
      return baseAccounts.filter((a) => a.accountId === edevletAccountCode);
    }
    if (operationType === "REFUND" && edevletAccountCode) {
      return baseAccounts.filter((a) => a.accountId === edevletAccountCode);
    }
    if (operationType === "LEGAL_PAYMENT" || operationType === "LEGAL_REFUND") {
      return []; // Sadece yasal dosya göster
    }
    return baseAccounts;
  })();

  const visibleLegal = (() => {
    if (operationType === "PAYMENT" || operationType === "REFUND") {
      return []; // Sadece hesap göster
    }
    return legalFiles ?? [];
  })();

  const hasAccounts = visibleAccounts.length > 0;
  const hasLegal = visibleLegal.length > 0;
  const isEmpty = !hasAccounts && !hasLegal;

  const handleNewQuery = () => {
    clearAll();
    router.push("/");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto space-y-6"
      >
        {/* Üst bilgi kartı */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-400" />
                <p className="text-green-400 text-sm font-medium">Sorgulama başarılı</p>
              </div>
              {fullName && <p className="text-white font-bold text-xl">{fullName}</p>}
              <p className="text-white/40 text-xs font-mono mt-0.5">TC: {activeTckn}</p>
              {inLegalProc && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Scale size={13} className="text-orange-400" />
                  <p className="text-orange-300 text-xs font-medium">Yasal takip kaydı mevcut</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-0.5">Toplam borç</p>
              <p className="text-white font-bold text-2xl">{formatTL(totalDebt)}</p>
            </div>
          </div>
        </div>

        {/* Borç yok */}
        {isEmpty && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">Borç Bulunamadı</p>
            <p className="text-white/50 text-sm mt-1">Bu TC kimlik numarasına ait borç kaydı yoktur.</p>
          </div>
        )}

        {/* Normal hesaplar */}
        {hasAccounts && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle size={15} className="text-red-400" />
              <p className="text-white/60 text-sm font-medium">
                {visibleAccounts.length} hesap kaydı
              </p>
            </div>
            {visibleAccounts.map((account, i) => (
              <AccountRow key={account.accountId} account={account} tckn={activeTckn} index={i} />
            ))}
          </div>
        )}

        {/* Yasal takip dosyaları */}
        {hasLegal && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Scale size={15} className="text-orange-400" />
              <p className="text-white/60 text-sm font-medium">
                {visibleLegal.length} yasal takip dosyası
              </p>
            </div>
            {visibleLegal.map((file, i) => (
              <LegalFileRow key={file.fileNumber} file={file} tckn={activeTckn} index={i} />
            ))}
          </div>
        )}

        {/* Yeni sorgulama */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleNewQuery}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Yeni Sorgulama
          </button>
        </div>
      </motion.div>

      <PaymentModal />
      <RefundModal />
    </>
  );
}
