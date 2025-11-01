
// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'My App',
  description: 'Next.js + Tailwind Project',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 font-sans">
        <header className="bg-primary text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">My Activity Tracker</h1>
        </header>
        <main className="min-h-screen p-6">{children}</main>
      </body>
    </html>
  )
}
