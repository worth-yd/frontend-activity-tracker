
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white">
      {/* 🔝 Navbar */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-md">
          Dev<span className="text-pink-300">Connect</span>
        </h1>
      </header>

      {/* 💎 Hero Section */}
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-1 flex-col items-center justify-center text-center px-6"
      >
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Yazılımcılar İçin <br /> Yeni Bir <span className="text-pink-200">Bağlantı Dünyası</span>
        </h2>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10">
          Projelerini paylaş, arkadaş edin, topluluklara katıl.
          <br />
          Nabersiniz. Dashboard
        </p>

      </motion.main>

      {/* ⚡️ Footer */}
      <footer className="text-center py-6 text-white/70 text-sm backdrop-blur-sm">
        © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
