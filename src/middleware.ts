
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ✅ Middleware fonksiyonunu export ediyoruz
export function middleware(req: NextRequest) {
  const token = req.cookies.get('jwt')?.value
  const { pathname } = req.nextUrl

  // 🔒 Korunacak sayfaları belirliyoruz
  const protectedPaths = ['/profile', '/dashboard', '/orders']

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  // 🧩 Token yoksa login sayfasına yönlendir
  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Token varsa devam et
  return NextResponse.next()
}

// ✅ Hangi rotalarda çalışacağını belirtiyoruz
export const config = {
  matcher: ['/profile/:path*', '/dashboard/:path*', '/orders/:path*'],
}
