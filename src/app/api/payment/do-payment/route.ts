import { NextRequest, NextResponse } from "next/server";
import { paymentMock } from "@/mocks/payment.mock";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const MOCK_MODE = process.env.MOCK_MODE === "true";

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

    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ success: true, data: paymentMock });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0";

    const response = await fetch(`${BACKEND_URL}/debit-payment/api/payment/do-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ipAddress,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Ödeme işlemi başarısız." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ödeme işlemi sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
