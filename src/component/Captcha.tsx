"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 6): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${rand(80, 160)},${rand(80, 160)},${rand(80, 160)},0.5)`;
    ctx.lineWidth = rand(1, 2);
    ctx.beginPath();
    ctx.moveTo(rand(0, W), rand(0, H));
    ctx.lineTo(rand(0, W), rand(0, H));
    ctx.stroke();
  }

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${rand(100, 200)},${rand(100, 200)},${rand(100, 200)},0.4)`;
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(1, 2), 0, Math.PI * 2);
    ctx.fill();
  }

  const fonts = ["Arial", "Verdana", "Tahoma"];
  const charW = W / (code.length + 1);

  code.split("").forEach((char, i) => {
    ctx.save();
    ctx.font = `bold ${rand(22, 28)}px ${fonts[i % fonts.length]}`;
    ctx.fillStyle = `hsl(${rand(180, 260)}, 70%, 75%)`;
    ctx.translate(charW * (i + 0.7) + rand(-4, 4), H / 2 + rand(-4, 6));
    ctx.rotate((rand(-20, 20) * Math.PI) / 180);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

interface CaptchaProps {
  onValidChange: (valid: boolean) => void;
}

export default function Captcha({ onValidChange }: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");

  const refresh = useCallback(() => {
    const newCode = generateCode();
    setCode(newCode);
    setInput("");
    onValidChange(false);
  }, [onValidChange]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (canvasRef.current && code) drawCaptcha(canvasRef.current, code);
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 6);
    setInput(val);
    onValidChange(val === code);
  };

  const isError = input.length === 6 && input !== code;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">Güvenlik Kodu</label>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={180}
          height={52}
          className="rounded-lg border border-white/20 select-none"
        />
        <button
          type="button"
          onClick={refresh}
          title="Yenile"
          className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/50 hover:text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Yukarıdaki kodu giriniz"
        autoComplete="off"
        className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/30 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 transition-all ${
          isError
            ? "border-red-400 focus:ring-red-400/40"
            : "border-white/20 focus:ring-red-500/40 focus:border-red-500"
        }`}
      />
      {isError && <p className="text-red-400 text-xs">Güvenlik kodu hatalı.</p>}
    </div>
  );
}
