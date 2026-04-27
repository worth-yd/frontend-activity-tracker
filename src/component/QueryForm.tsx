"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, User, MapPin, Loader2 } from "lucide-react";
import axios from "axios";
import { useDebt } from "@/context/DebtContext";
import Captcha from "@/component/Captcha";

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
  gun: string;
  ay: string;
  yil: string;
}

export default function QueryForm() {
  const router = useRouter();
  const { setQueryData, setQueryResult } = useDebt();

  const [form, setForm] = useState<FormState>({
    tc: "",
    anaAdi: "",
    babaAdi: "",
    dogumYeri: "",
    gun: "",
    ay: "",
    yil: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const ayRef = useRef<HTMLSelectElement>(null);
  const yilRef = useRef<HTMLInputElement>(null);

  const maxDayForMonth = (ay: string, yil: string): number => {
    const m = parseInt(ay, 10);
    const y = parseInt(yil, 10) || 2000;
    if (!m) return 31;
    return new Date(y, m, 0).getDate(); // ayın son günü
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (field === "tc") val = val.replace(/\D/g, "").slice(0, 11);
    if (field === "yil") val = val.replace(/\D/g, "").slice(0, 4);

    if (field === "gun") {
      val = val.replace(/\D/g, "").slice(0, 2);
      const num = parseInt(val, 10);
      // İlk rakam 4-9 ise tek haneli gün olamaz, 2 hane bekliyoruz
      if (val.length === 1 && num >= 4) {
        // geçerli, bekle
      }
      if (val.length === 2) {
        if (num < 1) val = "01";
        // max kontrolü ay seçiliyse ona göre, değilse 31
        const max = maxDayForMonth(form.ay, form.yil);
        if (num > max) val = String(max).padStart(2, "0");
        // 2 hane tamamlandı → aya geç
        setTimeout(() => ayRef.current?.focus(), 0);
      }
    }

    setForm((prev) => ({ ...prev, [field]: val }));

    if (field === "ay" && val) {
      // Ay seçildi → yıla geç
      setTimeout(() => yilRef.current?.focus(), 0);
      // Mevcut gün yeni ayla geçersizse düzelt
      setForm((prev) => {
        const max = maxDayForMonth(val, prev.yil);
        const g = parseInt(prev.gun, 10);
        return g > max ? { ...prev, ay: val, gun: String(max).padStart(2, "0") } : { ...prev, ay: val };
      });
      setErrors((prev) => ({ ...prev, dogumTarihi: undefined }));
      return;
    }

    if (field === "gun" || field === "yil") {
      setErrors((prev) => ({ ...prev, dogumTarihi: undefined }));
    } else if (errors[field as keyof FieldError]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const buildBirthDate = () => {
    const g = form.gun.padStart(2, "0");
    const a = form.ay.padStart(2, "0");
    const y = form.yil;
    if (!g || !a || !y || y.length !== 4) return "";
    return `${g}.${a}.${y}`;
  };

  const validate = (): boolean => {
    const errs: FieldError = {};

    if (!form.tc || form.tc.length !== 11) {
      errs.tc = "TC Kimlik No 11 haneli olmalıdır.";
    } else if (form.tc[0] === "0") {
      errs.tc = "TC Kimlik No 0 ile başlayamaz.";
    }

    if (!form.anaAdi.trim()) errs.anaAdi = "Anne adı zorunludur.";
    if (!form.babaAdi.trim()) errs.babaAdi = "Baba adı zorunludur.";
    if (!form.dogumYeri.trim()) errs.dogumYeri = "Doğum yeri zorunludur.";

    const g = parseInt(form.gun, 10);
    const a = parseInt(form.ay, 10);
    const y = parseInt(form.yil, 10);
    const currentYear = new Date().getFullYear();

    if (!form.gun || !form.ay || !form.yil) {
      errs.dogumTarihi = "Doğum tarihi zorunludur.";
    } else if (form.yil.length !== 4 || y < 1900 || y > currentYear) {
      errs.dogumTarihi = `Yıl 1900 ile ${currentYear} arasında olmalıdır.`;
    } else if (a < 1 || a > 12) {
      errs.dogumTarihi = "Geçerli bir ay seçiniz.";
    } else if (g < 1 || g > maxDayForMonth(form.ay, form.yil)) {
      errs.dogumTarihi = `${form.ay}. ay için geçerli gün 1-${maxDayForMonth(form.ay, form.yil)} arasında olmalıdır.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    if (!captchaValid) {
      setServerError("Lütfen güvenlik kodunu doğru giriniz.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/query", {
        tckn: form.tc,
        motherName: form.anaAdi,
        fatherName: form.babaAdi,
        birthPlace: form.dogumYeri,
        birthDate: buildBirthDate(),
      });

      setQueryData({ ...form, dogumTarihi: buildBirthDate() });
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
    `w-full px-3 py-1.5 rounded-lg bg-white/10 border text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
    }`;

  const iconInputClass = (err?: string) =>
    `w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/10 border text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
      err ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
    }`;

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 mb-2">
            <Search className="text-red-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Borç Sorgulama</h2>
          <p className="text-white/50 text-xs mt-0.5">Bilgilerinizi eksiksiz doldurunuz</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* TC Kimlik No */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">TC Kimlik No</label>
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
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Anne Adı</label>
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
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Baba Adı</label>
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

          {/* Doğum Yeri */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Doğum Yeri</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                value={form.dogumYeri}
                onChange={set("dogumYeri")}
                placeholder="Örn: İstanbul"
                className={iconInputClass(errors.dogumYeri)}
              />
            </div>
            {errors.dogumYeri && <p className="text-red-400 text-xs">{errors.dogumYeri}</p>}
          </div>

          {/* Doğum Tarihi — Gün / Ay / Yıl */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Doğum Tarihi</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={form.gun}
                onChange={set("gun")}
                placeholder="GG"
                maxLength={2}
                className={`${inputClass(errors.dogumTarihi)} text-center font-mono`}
              />
              <select
                ref={ayRef}
                value={form.ay}
                onChange={set("ay")}
                className={`w-full px-2 py-1.5 rounded-lg bg-white/10 border text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.dogumTarihi ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
                }`}
              >
                <option value="" className="bg-gray-800">Ay</option>
                {months.map((m, i) => (
                  <option key={i} value={String(i + 1).padStart(2, "0")} className="bg-gray-800">{m}</option>
                ))}
              </select>
              <input
                ref={yilRef}
                type="text"
                inputMode="numeric"
                value={form.yil}
                onChange={set("yil")}
                placeholder="YYYY"
                maxLength={4}
                className={`${inputClass(errors.dogumTarihi)} text-center font-mono`}
              />
            </div>
            {errors.dogumTarihi && <p className="text-red-400 text-xs">{errors.dogumTarihi}</p>}
          </div>

          {/* Captcha */}
          <Captcha onValidChange={setCaptchaValid} />

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
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-1"
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
