"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Loader2, CheckCircle2, AlertCircle, Building2, User } from "lucide-react";
import axios from "axios";
import { useDebt } from "@/context/DebtContext";
import VirtualKeyboard from "@/component/VirtualKeyboard";

type RefundStatus = "idle" | "loading" | "success" | "error";

interface RefundForm {
  name: string;
  iban: string;      // 24 rakam, TR prefix'siz
  bankName: string;
}

interface FieldError {
  name?: string;
  iban?: string;
  bankName?: string;
}

function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function displayIban(raw: string): string {
  // 4'lü gruplar halinde göster: TR12 3456 7890 ...
  return raw.replace(/(.{4})/g, "$1 ").trim();
}

export default function RefundModal() {
  const { selectedItem, isRefundModalOpen, closeRefundModal, queryResult, tckn, edevletToken } = useDebt();

  const [form, setForm] = useState<RefundForm>({
    name: queryResult?.fullName ?? "",
    iban: "",
    bankName: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [status, setStatus] = useState<RefundStatus>("idle");
  const [changeOrderNumber, setChangeOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [ibanKeyboardOpen, setIbanKeyboardOpen] = useState(false);
  const ibanRef = useRef<HTMLDivElement>(null);

  const handleIbanDigit = (digit: string) => {
    setForm((prev) => {
      if (prev.iban.length >= 24) return prev;
      return { ...prev, iban: prev.iban + digit };
    });
    setErrors((prev) => ({ ...prev, iban: undefined }));
  };

  const handleIbanDelete = () => {
    setForm((prev) => ({ ...prev, iban: prev.iban.slice(0, -1) }));
  };

  const amount =
    selectedItem?.type === "account"
      ? (selectedItem.invoice?.amount ?? selectedItem.account.currentHolding)
      : selectedItem?.type === "legal"
      ? selectedItem.file.totalHolding
      : 0;

  const accountCode =
    selectedItem?.type === "account" ? selectedItem.account.accountId : 0;

  const fileNumber =
    selectedItem?.type === "legal" ? selectedItem.file.fileNumber : undefined;

  const paymentRefundType = selectedItem?.type === "legal" ? "YTS" : "INVOICE";

  const documentLabel =
    selectedItem?.type === "account"
      ? `Hesap No: ${selectedItem.account.accountId}`
      : selectedItem?.type === "legal"
      ? `Dosya No: ${selectedItem.file.fileNumber}`
      : "";

  const setField = (field: keyof RefundForm, formatter?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = formatter ? formatter(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: val }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errs: FieldError = {};
    if (!form.name.trim()) errs.name = "Ad soyad zorunludur.";
    if (form.iban.length !== 24) errs.iban = "IBAN TR prefix'siz 24 rakam olmalıdır.";
    if (!form.bankName.trim()) errs.bankName = "Banka adı zorunludur.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedItem) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const { data } = await axios.post(
        `/api/refund?accountFullName=${encodeURIComponent(queryResult?.fullName ?? "")}`,
        {
          accountCode,
          tckn,
          amount,
          name: form.name,
          iban: form.iban,
          bankName: form.bankName,
          paymentRefundType,
          fileNumber,
          token: edevletToken ?? undefined,
        }
      );

      setChangeOrderNumber(data.data?.changeOrderNumber ?? "");
      setStatus("success");
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "İade talebi gönderilemedi. Lütfen tekrar deneyin.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status === "loading") return;
    setForm({ name: queryResult?.fullName ?? "", iban: "", bankName: "" });
    setErrors({});
    setStatus("idle");
    setErrorMsg("");
    setChangeOrderNumber("");
    setIbanKeyboardOpen(false);
    closeRefundModal();
  };

  const inputClass = (err?: string) =>
    `w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-green-500/40 focus:border-green-500"
    }`;

  const iconInputClass = (err?: string) =>
    `w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-green-500/40 focus:border-green-500"
    }`;

  return (
    <AnimatePresence>
      {isRefundModalOpen && selectedItem && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Başlık */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-400/30">
                    <RotateCcw size={16} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">İade Talebi</h3>
                    <p className="text-white/40 text-xs">{documentLabel}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="text-white/40 hover:text-white transition-colors disabled:opacity-30"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tutar özeti */}
              <div className="mx-6 mt-5 bg-green-500/10 border border-green-400/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-green-300 text-xs font-medium">İade Tutarı</p>
                  <p className="text-white/40 text-xs mt-0.5">{paymentRefundType === "YTS" ? "YTS İadesi" : "Fatura İadesi"}</p>
                </div>
                <p className="text-white font-bold text-xl">{formatTL(amount)}</p>
              </div>

              <div className="p-6">
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 space-y-3"
                  >
                    <CheckCircle2 size={48} className="text-green-400 mx-auto" />
                    <p className="text-white font-bold text-lg">İade Talebi Alındı!</p>
                    <p className="text-white/60 text-sm">
                      {formatTL(amount)} tutarındaki iade talebiniz oluşturuldu.
                    </p>
                    {changeOrderNumber && (
                      <p className="text-white/40 text-xs font-mono">Değişim Emri No: {changeOrderNumber}</p>
                    )}
                    <button
                      onClick={handleClose}
                      className="mt-4 w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
                    >
                      Kapat
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Ad Soyad */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80">Hesap Sahibi Adı Soyadı</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                          type="text"
                          value={form.name}
                          onChange={setField("name")}
                          placeholder="AD SOYAD"
                          className={`${iconInputClass(errors.name)} uppercase`}
                        />
                      </div>
                      {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                    </div>

                    {/* IBAN */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80">
                        IBAN <span className="text-white/40 font-normal">(TR prefix&apos;siz, 24 rakam)</span>
                      </label>
                      <div className="relative" ref={ibanRef}>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-bold">TR</span>
                        <input
                          type="text"
                          readOnly
                          value={displayIban(form.iban)}
                          onClick={() => setIbanKeyboardOpen((v) => !v)}
                          placeholder="00 0000 0000 0000 0000 0000"
                          className={`${inputClass(errors.iban)} pl-10 font-mono tracking-wider cursor-pointer ${
                            ibanKeyboardOpen ? "border-green-500 ring-2 ring-green-500/40" : ""
                          }`}
                        />
                        <VirtualKeyboard
                          isOpen={ibanKeyboardOpen}
                          onClose={() => setIbanKeyboardOpen(false)}
                          onDigit={handleIbanDigit}
                          onDelete={handleIbanDelete}
                          anchorRef={ibanRef}
                        />
                      </div>
                      <p className="text-white/30 text-xs">{form.iban.length}/24 rakam</p>
                      {errors.iban && <p className="text-red-400 text-xs">{errors.iban}</p>}
                    </div>

                    {/* Banka Adı */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80">Banka Adı</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                          type="text"
                          value={form.bankName}
                          onChange={setField("bankName")}
                          placeholder="Örn: Garanti BBVA"
                          className={iconInputClass(errors.bankName)}
                        />
                      </div>
                      {errors.bankName && <p className="text-red-400 text-xs">{errors.bankName}</p>}
                    </div>

                    {status === "error" && errorMsg && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2.5">
                        <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-400 text-xs">{errorMsg}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-green-700/50 text-white font-bold transition-all flex items-center justify-center gap-2 mt-1"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          İşlem yapılıyor...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={16} />
                          İade Talep Et
                        </>
                      )}
                    </button>

                    <p className="text-white/30 text-xs text-center">
                      İade tutarı belirtilen IBAN&apos;a aktarılacaktır.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
