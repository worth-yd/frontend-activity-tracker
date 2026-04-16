import { NextRequest, NextResponse } from "next/server";
import { refundMock } from "@/mocks/refund.mock";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const MOCK_MODE = process.env.MOCK_MODE === "true";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tckn, amount, name, iban, bankName, paymentRefundType } = body;

    if (!tckn || !amount || !name || !iban || !bankName || !paymentRefundType) {
      return NextResponse.json(
        { success: false, message: "Eksik iade bilgisi." },
        { status: 400 }
      );
    }

    if (iban.length !== 24 || !/^\d{24}$/.test(iban)) {
      return NextResponse.json(
        { success: false, message: "IBAN TR prefix'siz 24 rakam olmalıdır." },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ success: true, data: refundMock });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0";

    const accountFullName = new URL(req.url).searchParams.get("accountFullName") ?? "";

    const response = await fetch(
      `${BACKEND_URL}/debit-payment/api/refund/request?accountFullName=${encodeURIComponent(accountFullName)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": ipAddress,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "İade işlemi başarısız." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "İade işlemi sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
