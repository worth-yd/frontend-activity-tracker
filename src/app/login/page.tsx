"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import AppBar from "@/component/AppBar";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Lütfen geçerli bir email girin 📧");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true },
      );
      alert("Giriş başarılı! 👌");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.error || err.message || "Bir hata oluştu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;
      const decoded: any = jwtDecode(token);
      await axios.post(
        "/api/auth/google",
        { token },
        { withCredentials: true },
      );
      alert(`Hoş geldin ${decoded.name} 👋`);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google girişinde hata oluştu");
    }
  };

  const handleGoogleError = () =>
    setError("Google ile giriş başarısız oldu 😢");

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-6">
      {/* AppBar */}
      <AppBar />

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mt-24 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
          Hoş Geldin 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-white/90 font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-white/50" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ornek.com"
                className="w-full bg-white/20 border border-white/30 rounded-lg py-2 pl-10 pr-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-white/90 font-medium">
              Şifre
            </label>
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
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </motion.button>
        </form>

        <div className="mt-6 flex justify-center">
          <GoogleOAuthProvider clientId="774002077039-8bkm16b6i18pvf8uosskmfaorkfaidnh.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>

        <p className="mt-6 text-center text-sm text-white/80">
          Hesabınız yok mu?{" "}
          <Link
            href="/register"
            className="text-pink-300 font-medium hover:underline"
          >
            Kayıt Ol
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
