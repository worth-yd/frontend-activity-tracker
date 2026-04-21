"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useDebt } from "@/context/DebtContext";
import { OperationType } from "@/types/debt";

type PageState = "loading" | "error";

function parseOpType(raw: string | null): OperationType | null {
  const map: Record<string, OperationType> = {
    Query: "QUERY",
    Payment: "PAYMENT",
    Refund: "REFUND",
    LegalPayment: "LEGAL_PAYMENT",
    LegalRefund: "LEGAL_REFUND",
    QUERY: "QUERY",
    PAYMENT: "PAYMENT",
    REFUND: "REFUND",
    LEGAL_PAYMENT: "LEGAL_PAYMENT",
    LEGAL_REFUND: "LEGAL_REFUND",
  };
  return raw ? (map[raw] ?? null) : null;
}

function EdevletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setQueryResult, setOperationType, setEdevletData } = useDebt();

  const [state, setState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get("token") ?? searchParams.get("tokenString");
    const opTypeRaw = searchParams.get("opType") ?? searchParams.get("operationType");
    const operationType = parseOpType(opTypeRaw);

    if (!token) {
      setErrorMsg("Geçerli bir e-Devlet bağlantısı bulunamadı. Token parametresi eksik.");
      setState("error");
      return;
    }

    if (!operationType) {
      setErrorMsg("İşlem türü (opType) geçersiz veya eksik.");
      setState("error");
      return;
    }

    const run = async () => {
      try {
        const { data } = await axios.post("/api/token", {
          tokenString: token,
          operationType,
        });

        if (!data.success || !data.data) {
          setErrorMsg(data.message || "Token doğrulama başarısız.");
          setState("error");
          return;
        }

        const tokenData = data.data;
        setQueryResult(tokenData.queryResult, tokenData.tckn);
        setOperationType(tokenData.operationType ?? operationType);
        setEdevletData(token, tokenData.accountCode ?? 0);

        router.replace("/results");
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "e-Devlet doğrulama sırasında bir hata oluştu.";
        setErrorMsg(msg);
        setState("error");
      }
    };

    run();
  }, [searchParams, router, setQueryResult, setOperationType, setEdevletData]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          {state === "loading" ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-5 mx-auto">
                <ShieldCheck className="text-blue-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">e-Devlet Doğrulanıyor</h2>
              <p className="text-white/50 text-sm mb-6">
                Kimlik bilgileriniz güvenli şekilde doğrulanıyor, lütfen bekleyiniz...
              </p>
              <Loader2 size={28} className="animate-spin text-blue-400 mx-auto" />
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 border border-red-400/30 mb-5 mx-auto">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Doğrulama Başarısız</h2>
              <p className="text-white/50 text-sm mb-6">{errorMsg}</p>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function EdevletPage() {
  return (
    <Suspense>
      <EdevletContent />
    </Suspense>
  );
}
