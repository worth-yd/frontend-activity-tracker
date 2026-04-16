"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, User, MapPin, Calendar, Loader2 } from "lucide-react";
import axios from "axios";
import { useDebt } from "@/context/DebtContext";

interface FieldError {
  tc?: string;
  anaAdi?: string;
  babaAdi?: string;
  dogumYeri?: string;
  dogumTarihi?: string;
}

interface FormState {
  tc: string;
  anaAdi: string;
  babaAdi: string;
  dogumYeri: string;
  dogumTarihi: string;
}

export default function QueryForm() {
  const router = useRouter();
  const { setQueryData, setQueryResult } = useDebt();

  const [form, setForm] = useState<FormState>({
    tc: "",
    anaAdi: "",
    babaAdi: "",
    dogumYeri: "",
    dogumTarihi: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === "tc" ? e.target.value.replace(/\D/g, "").slice(0, 11) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field as keyof FieldError]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FieldError = {};

    if (!form.tc || form.tc.length !== 11) {
      errs.tc = "TC Kimlik No 11 haneli olmalıdır.";
    } else if (form.tc[0] === "0") {
      errs.tc = "TC Kimlik No 0 ile başlayamaz.";
    }


    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/api/query", {
        tckn: form.tc,
      });

      setQueryData({ ...form });
      setQueryResult(data.data, form.tc);
      router.push("/results");
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Sorgulama sırasında hata oluştu. Lütfen tekrar deneyin.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (err?: string) =>
    `w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
    }`;

  const iconInputClass = (err?: string) =>
    `w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/20 border border-red-400/30 mb-4">
            <Search className="text-red-400" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Borç Sorgulama</h2>
          <p className="text-white/50 text-sm mt-1">Bilgilerinizi eksiksiz doldurunuz</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* TC Kimlik No */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">TC Kimlik No</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.tc}
              onChange={set("tc")}
              placeholder="Örn: 12345678901"
              className={`${inputClass(errors.tc)} tracking-widest font-mono`}
            />
            {errors.tc && <p className="text-red-400 text-xs">{errors.tc}</p>}
          </div>

          {/* Anne Adı */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">Anne Adı</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                value={form.anaAdi}
                onChange={set("anaAdi")}
                placeholder="Örn: Fatma"
                className={iconInputClass(errors.anaAdi)}
              />
            </div>
            {errors.anaAdi && <p className="text-red-400 text-xs">{errors.anaAdi}</p>}
          </div>

          {/* Baba Adı */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">Baba Adı</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                value={form.babaAdi}
                onChange={set("babaAdi")}
                placeholder="Örn: Mehmet"
                className={iconInputClass(errors.babaAdi)}
              />
            </div>
            {errors.babaAdi && <p className="text-red-400 text-xs">{errors.babaAdi}</p>}
          </div>

          {/* Doğum Yeri + Doğum Tarihi yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">Doğum Yeri</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="text"
                  value={form.dogumYeri}
                  onChange={set("dogumYeri")}
                  placeholder="İstanbul"
                  className={iconInputClass(errors.dogumYeri)}
                />
              </div>
              {errors.dogumYeri && <p className="text-red-400 text-xs">{errors.dogumYeri}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/80">Doğum Tarihi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="date"
                  value={form.dogumTarihi}
                  onChange={set("dogumTarihi")}
                  className={`${iconInputClass(errors.dogumTarihi)} [color-scheme:dark]`}
                />
              </div>
              {errors.dogumTarihi && <p className="text-red-400 text-xs">{errors.dogumTarihi}</p>}
            </div>
          </div>

          {/* Sunucu Hatası */}
          {serverError && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm text-center">{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sorgulanıyor...
              </>
            ) : (
              <>
                <Search size={18} />
                Sorgula
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
