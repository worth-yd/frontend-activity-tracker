import { NextRequest, NextResponse } from "next/server";

/**
 * e-Devlet entegrasyon kapısı — eski sistem URL'i birebir korunuyor.
 *
 * e-Devlet portalı bu endpoint'e form POST yapar:
 *   POST /DebitPayment/Home/EDevletTokenGate?opType=Payment
 *   Content-Type: application/x-www-form-urlencoded
 *   Body: token=<TOKEN_STRING>
 *
 * token  → form body
 * opType → URL query param
 */
export async function POST(req: NextRequest) {
  const opType = req.nextUrl.searchParams.get("opType") ?? "";

  let token = "";
  try {
    const formData = await req.formData();
    token = (formData.get("token") as string) ?? "";
  } catch {
    return NextResponse.json(
      { success: false, message: "Form verisi okunamadı." },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token parametresi eksik." },
      { status: 400 }
    );
  }

  if (!opType) {
    return NextResponse.json(
      { success: false, message: "opType parametresi eksik." },
      { status: 400 }
    );
  }

  const redirectUrl = new URL("/edevlet", req.nextUrl.origin);
  redirectUrl.searchParams.set("token", token);
  redirectUrl.searchParams.set("opType", opType);

  return NextResponse.redirect(redirectUrl, { status: 303 });
}

/**
 * GET — test/geliştirme kolaylığı için.
 * e-Devlet bazı entegrasyonlarda önce GET ile probe edebilir.
 */
export async function GET(req: NextRequest) {
  const opType = req.nextUrl.searchParams.get("opType") ?? "";
  const token =
    req.nextUrl.searchParams.get("token") ??
    req.nextUrl.searchParams.get("tokenString") ??
    "";

  if (!token || !opType) {
    return NextResponse.json(
      { success: false, message: "token ve opType parametreleri zorunludur." },
      { status: 400 }
    );
  }

  const redirectUrl = new URL("/edevlet", req.nextUrl.origin);
  redirectUrl.searchParams.set("token", token);
  redirectUrl.searchParams.set("opType", opType);

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
