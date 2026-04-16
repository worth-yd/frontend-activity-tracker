import { NextRequest, NextResponse } from "next/server";
import { tokenMock } from "@/mocks/token.mock";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const MOCK_MODE = process.env.MOCK_MODE === "true";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenString, operationType } = body;

    if (!tokenString || !operationType) {
      return NextResponse.json(
        { success: false, message: "tokenString ve operationType zorunludur." },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ success: true, data: { ...tokenMock, operationType } });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "0.0.0.0";

    const response = await fetch(`${BACKEND_URL}/debit-payment/api/customer/token`, {
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
        { success: false, message: data.message || "Token doğrulama başarısız." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Token doğrulama sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
