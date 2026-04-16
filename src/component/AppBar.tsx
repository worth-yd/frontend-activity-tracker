"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function VodafoneLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Kırmızı daire */}
      <circle cx="100" cy="100" r="100" fill="#E60000" />
      {/* Vodafone tırnak işareti (speechmark) */}
      <path
        d="M100 40C67.9 40 42 65.9 42 98C42 118.6 52.6 136.7 68.7 147.5C70.3 148.6 71 150.6 70.4 152.4L63.2 174.4C62.3 177.2 65.2 179.7 67.8 178.3L96.2 163.1C97.4 162.5 98.7 162.2 100 162.2C132.1 162.2 158 136.3 158 104.2C158 72.1 132.1 46.2 100 46.2L100 40Z"
        fill="white"
      />
      <circle cx="100" cy="100" r="28" fill="#E60000" />
    </svg>
  );
}

export default function AppBar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full fixed top-0 left-0 flex items-center px-6 py-3 bg-black/30 backdrop-blur-md border-b border-white/10 shadow-md z-50"
    >
      <div className="flex justify-between w-full items-center max-w-4xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-white font-bold text-lg">
          <VodafoneLogo size={36} />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-base tracking-wide">Vodafone</span>
            <span className="text-white/60 font-normal text-xs tracking-wider">Borç Sorgulama</span>
          </div>
        </Link>

        {/* Anasayfaya dön (sadece results sayfasında göster) */}
        {pathname !== "/" && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <Home size={15} />
            Ana Sayfa
          </Link>
        )}
      </div>
    </motion.nav>
  );
}
