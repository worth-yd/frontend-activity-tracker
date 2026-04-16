import { NextRequest, NextResponse } from "next/server";
import { PaymentResponse } from "@/types/debt";

// TODO: Backend hazır olduğunda mock'u kaldırıp şu satırları aç:
// import axios from "axios";
// const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
// const { data } = await axios.post(`${BACKEND_URL}/api/payment`, body);
// return NextResponse.json(data);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tckn, amount, documentNumber, paymentRefundType, creditCard } = body;

    if (!tckn || !amount || !documentNumber || !paymentRefundType || !creditCard) {
      return NextResponse.json(
        { success: false, message: "Eksik ödeme bilgisi." },
        { status: 400 }
      );
    }

    // MOCK: yapay gecikme
    await new Promise((r) => setTimeout(r, 1200));

    const result: PaymentResponse = {
      bankRefId: `REF-${Date.now()}`,
      bankOrderId: `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      bankReturnCode: "00",
      returnMessage: "Ödemeniz başarıyla gerçekleştirildi.",
    };

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ödeme işlemi sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
