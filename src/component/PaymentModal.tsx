"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { useDebt } from "@/context/DebtContext";
// import { CreditCardRequest } from "@/types/debt"; // TODO: Backend açılınca uncomment et

type PaymentStatus = "idle" | "loading" | "success" | "error";

interface CardForm {
  number: string;      // gösterimde boşluklu, gönderimde boşluksuz
  holder: string;
  month: string;       // AA
  year: string;        // YYYY
  cvv: string;
  issuer: "Visa" | "Master Kart";
}

interface FieldError {
  number?: string;
  holder?: string;
  month?: string;
  year?: string;
  cvv?: string;
  issuer?: string;
}

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PaymentModal() {
  const { selectedItem, isPaymentModalOpen, closePaymentModal, tckn } = useDebt();

  const [form, setForm] = useState<CardForm>({
    number: "",
    holder: "",
    month: "",
    year: "",
    cvv: "",
    issuer: "Visa",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [transactionId, setTransactionId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Ödeme tutarı ve tipi selectedItem'dan türet
  const amount =
    selectedItem?.type === "account"
      ? (selectedItem.invoice?.amount ?? selectedItem.account.currentHolding)
      : selectedItem?.type === "legal"
      ? selectedItem.file.totalDebt || selectedItem.file.totalHolding
      : 0;

  const paymentRefundType = selectedItem?.type === "legal" ? "YTS" : "INVOICE";

  const documentNumber =
    selectedItem?.type === "account"
      ? (selectedItem.invoice?.invoiceNumber ?? String(selectedItem.account.accountId))
      : selectedItem?.type === "legal"
      ? selectedItem.file.fileNumber
      : "";

  const accountCode =
    selectedItem?.type === "account"
      ? selectedItem.account.accountId
      : 0; // YTS için accountCode backend'e ytsAccounts olarak geçecek

  const modalTitle =
    selectedItem?.type === "legal" ? "YTS Borç Ödemesi" : "Güvenli Ödeme";

  const modalSubtitle =
    selectedItem?.type === "account"
      ? `Hesap No: ${selectedItem.account.accountId}`
      : selectedItem?.type === "legal"
      ? `Dosya No: ${selectedItem.file.fileNumber}`
      : "";

  const setField = (field: keyof CardForm, formatter?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = formatter ? formatter(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: val }));
      if (errors[field as keyof FieldError])
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const errs: FieldError = {};
    const rawNumber = form.number.replace(/\s/g, "");

    if (rawNumber.length !== 16) errs.number = "Kart numarası 16 hane olmalıdır.";
    if (!form.holder.trim()) errs.holder = "Kart sahibi adı zorunludur.";
    if (!/^(0[1-9]|1[0-2])$/.test(form.month)) errs.month = "Geçerli bir ay giriniz (01-12).";
    if (!/^\d{4}$/.test(form.year) || Number(form.year) < 2025) errs.year = "Geçerli bir yıl giriniz.";
    if (!/^\d{3}$/.test(form.cvv)) errs.cvv = "CVV 3 haneli olmalıdır.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedItem) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      // TODO: Backend hazır olduğunda mock'u kaldır, bu bloğu aç:
      // const { data } = await axios.post("/api/payment/do-payment", {
      //   accountCode,
      //   tckn,
      //   amount,
      //   documentNumber,
      //   paymentRefundType,
      //   creditCard: {
      //     number: form.number.replace(/\s/g, ""),
      //     expirationMonth: form.month,
      //     expirationYear: Number(form.year),
      //     holder: form.holder.toUpperCase(),
      //     securityCode: form.cvv,
      //     issuer: form.issuer,
      //   },
      //   ytsAccounts: selectedItem.type === "legal"
      //     ? selectedItem.file.accounts.map((a) => a.accountCode).join(",")
      //     : undefined,
      // });

      // MOCK: 1 saniyelik gecikme
      await new Promise((r) => setTimeout(r, 1000));
      const data = { data: { bankRefId: "TXN-" + Date.now(), returnMessage: "Başarılı" } };

      setTransactionId(data.data.bankRefId || "");
      setStatus("success");
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Ödeme işlemi başarısız. Lütfen tekrar deneyin.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status === "loading") return;
    setForm({ number: "", holder: "", month: "", year: "", cvv: "", issuer: "Visa" });
    setErrors({});
    setStatus("idle");
    setErrorMsg("");
    setTransactionId("");
    closePaymentModal();
  };

  // accountCode ve tckn kullanılıyor — referans tutmak için
  void accountCode;
  void tckn;

  return (
    <AnimatePresence>
      {isPaymentModalOpen && selectedItem && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
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
                  <div className="p-2 rounded-lg bg-red-500/20 border border-red-400/30">
                    <Lock size={16} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{modalTitle}</h3>
                    <p className="text-white/40 text-xs">{modalSubtitle}</p>
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
              <div className="mx-6 mt-5 bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-white/50 text-xs">{paymentRefundType === "YTS" ? "YTS Borcu" : "Fatura Ödemesi"}</p>
                  <p className="text-white/40 text-xs font-mono mt-0.5">{documentNumber}</p>
                </div>
                <p className="text-white font-bold text-xl">{formatTL(amount)}</p>
              </div>

              <div className="p-6">
                {/* Başarı */}
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 space-y-3"
                  >
                    <CheckCircle2 size={48} className="text-green-400 mx-auto" />
                    <p className="text-white font-bold text-lg">İşlem Başarılı!</p>
                    <p className="text-white/60 text-sm">
                      {formatTL(amount)} tutarındaki işleminiz tamamlandı.
                    </p>
                    {transactionId && (
                      <p className="text-white/40 text-xs font-mono">Ref: {transactionId}</p>
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
                    {/* Kart Numarası */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80">Kart Numarası</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.number}
                          onChange={setField("number", formatCardNumber)}
                          placeholder="0000 0000 0000 0000"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 font-mono tracking-wider focus:outline-none focus:ring-2 transition-all ${
                            errors.number ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                          }`}
                        />
                      </div>
                      {errors.number && <p className="text-red-400 text-xs">{errors.number}</p>}
                    </div>

                    {/* Kart Sahibi */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/80">Kart Sahibinin Adı</label>
                      <input
                        type="text"
                        value={form.holder}
                        onChange={setField("holder")}
                        placeholder="AD SOYAD"
                        className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 uppercase focus:outline-none focus:ring-2 transition-all ${
                          errors.holder ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                        }`}
                      />
                      {errors.holder && <p className="text-red-400 text-xs">{errors.holder}</p>}
                    </div>

                    {/* Kart Tipi + Ay + Yıl + CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Kart Tipi */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-white/80">Kart Tipi</label>
                        <div className="flex gap-2">
                          {(["Visa", "Master Kart"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, issuer: type }))}
                              className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                form.issuer === type
                                  ? "bg-red-600/30 border-red-500 text-white"
                                  : "bg-white/5 border-white/15 text-white/50 hover:border-white/30"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ay */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-white/80">Ay</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.month}
                          onChange={setField("month", (v) => v.replace(/\D/g, "").slice(0, 2))}
                          placeholder="01"
                          className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 font-mono text-center focus:outline-none focus:ring-2 transition-all ${
                            errors.month ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                          }`}
                        />
                        {errors.month && <p className="text-red-400 text-xs">{errors.month}</p>}
                      </div>

                      {/* Yıl */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-white/80">Yıl</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.year}
                          onChange={setField("year", (v) => v.replace(/\D/g, "").slice(0, 4))}
                          placeholder="2027"
                          className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 font-mono text-center focus:outline-none focus:ring-2 transition-all ${
                            errors.year ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                          }`}
                        />
                        {errors.year && <p className="text-red-400 text-xs">{errors.year}</p>}
                      </div>

                      {/* CVV */}
                      <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-white/80">CVV</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={3}
                          value={form.cvv}
                          onChange={setField("cvv", (v) => v.replace(/\D/g, "").slice(0, 3))}
                          placeholder="•••"
                          className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 font-mono text-center focus:outline-none focus:ring-2 transition-all ${
                            errors.cvv ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                          }`}
                        />
                        {errors.cvv && <p className="text-red-400 text-xs">{errors.cvv}</p>}
                      </div>
                    </div>

                    {/* Hata */}
                    {status === "error" && errorMsg && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2.5">
                        <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-400 text-xs">{errorMsg}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-bold transition-all flex items-center justify-center gap-2 mt-1"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          İşlem yapılıyor...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          {formatTL(amount)} Öde
                        </>
                      )}
                    </button>

                    <p className="text-white/30 text-xs text-center">
                      256-bit SSL ile şifrelenmiş güvenli ödeme
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
