import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Şu an korunacak route yok. Backend entegrasyonu sonrası buraya auth eklenebilir.
export function middleware(req: NextRequest) {
  void req;
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
