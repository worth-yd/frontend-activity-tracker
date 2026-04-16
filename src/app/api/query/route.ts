import { NextRequest, NextResponse } from "next/server";
import { queryMock } from "@/mocks/query.mock";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const MOCK_MODE = process.env.MOCK_MODE === "true";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tckn } = body;

    if (tckn.length !== 11 || !/^\d+$/.test(tckn)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz TC Kimlik No." },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({ success: true, data: queryMock });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0";

    const response = await fetch(`${BACKEND_URL}/debit-payment/api/customer/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ipAddress,
      },
      body: JSON.stringify({ tckn }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Sunucu hatası." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
