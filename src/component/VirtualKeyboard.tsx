"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export default function VirtualKeyboard({
  isOpen,
  onClose,
  onDigit,
  onDelete,
  anchorRef,
}: VirtualKeyboardProps) {
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Tuşları her açılışta karıştır
  const shuffledDigits = useMemo(() => {
    if (!isOpen) return [];
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={keyboardRef}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 z-10 mt-1 bg-slate-800 border border-white/20 rounded-xl p-3 shadow-2xl"
        >
          <p className="text-white/30 text-xs text-center mb-2 font-medium tracking-wider uppercase">
            Sanal Klavye
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {shuffledDigits.slice(0, 9).map((digit) => (
              <KeyButton key={digit} label={digit} onClick={() => onDigit(digit)} />
            ))}
            {/* Son satır: boş, 0, sil */}
            <div />
            <KeyButton label={shuffledDigits[9]} onClick={() => onDigit(shuffledDigits[9])} />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onDelete}
              className="flex items-center justify-center py-3 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-colors active:scale-95"
            >
              <Delete size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function KeyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // input focus'u kaybetmemesi için
      onClick={onClick}
      className="flex items-center justify-center py-3 rounded-lg bg-white/10 border border-white/15 text-white font-bold text-base hover:bg-white/20 transition-colors active:scale-95"
    >
      {label}
    </button>
  );
}
