
'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Lock, User } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8080/login', {
        username,
        password,
      })

      const data = response.data
      console.log('Giriş başarılı:', data)

      console.log(data)
      // örnek: token varsa localStorage'a kaydet
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      alert('Giriş başarılı! 👌')
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error(err)
      // axios hata mesajı
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Bir hata oluştu'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
          Hoş Geldin 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-white/90 font-medium">Kullanıcı Adı</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-white/50" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kullanici_adi"
                className="w-full bg-white/20 border border-white/30 rounded-lg py-2 pl-10 pr-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-white/90 font-medium">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-white/50" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/20 border border-white/30 rounded-lg py-2 pl-10 pr-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center bg-red-500/20 rounded p-2">
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-white/80">
          Hesabınız yok mu?{' '}
          <a href="/register" className="text-pink-300 font-medium hover:underline">
            Kayıt Ol
          </a>
        </p>
      </motion.div>
    </div>
  )
}
