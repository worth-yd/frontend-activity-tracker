
// app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set({
    name: 'jwt',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  return res
}
