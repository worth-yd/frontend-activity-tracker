import "./globals.css";
import { ReactNode } from "react";
import AppBar from "@/component/AppBar";
import Providers from "@/component/Providers";

export const metadata = {
  title: "TC Borç Sorgulama",
  description: "TC Kimlik numaranızla borçlarınızı sorgulayın ve ödeyin.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gradient-to-br from-red-950 via-red-900 to-zinc-900 min-h-screen font-sans">
        <Providers>
          <AppBar />
          <main className="mt-20 min-h-screen p-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
