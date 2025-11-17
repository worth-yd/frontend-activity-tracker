"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full fixed top-0 left-0 flex items-center px-6 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-md z-50"
    >
      {/* Menü container */}
      <div className="flex justify-between w-full items-center">
        {/* Sol taraf: Ana sayfa linki */}
        {!isLoginPage && (
          <Link
            href="/"
            className="flex items-center gap-1 text-white/90 hover:text-white transition"
          >
            <Home size={18} />
            Anasayfa
          </Link>
        )}

        {/* Sağ taraf: Login / Register */}
        {isLoginPage ? (
          <Link
            href="/"
            className="ml-auto text-white/90 hover:text-white transition"
          >
            Anasayfa
          </Link>
        ) : (
          <Link
            href="/login"
            className="ml-auto flex items-center gap-1 text-white/90 hover:text-white transition"
          >
            <User size={18} />
            Giriş Yap
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {!isLoginPage && (
        <div className="md:hidden ml-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/90 hover:text-white transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Mobile Dropdown */}
      {isOpen && !isLoginPage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-full left-0 w-full bg-white/10 backdrop-blur-md border-b border-white/20 flex flex-col items-center gap-4 py-4 md:hidden"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-white/90 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <Home size={18} />
            Anasayfa
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1 text-white/90 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            Giriş Yap
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
