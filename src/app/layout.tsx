// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import AppBar from "@/component/AppBar";

export const metadata = {
  title: "My App",
  description: "Next.js + Tailwind Project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 min-h-screen font-sans">
        {/* Global AppBar */}
        <AppBar />

        {/* Sayfa içeriği AppBar altında */}
        <main className="mt-24 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
