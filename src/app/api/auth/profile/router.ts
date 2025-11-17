
// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { getToken } from '@/lib/auth'

export async function GET() {
  const token = getToken()
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // Spring Boot backend'e token ile isteği gönder
  const response = await fetch('http://localhost:8080/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userData = await response.json()
  return NextResponse.json(userData)
}
