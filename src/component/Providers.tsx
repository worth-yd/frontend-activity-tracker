"use client";

import { DebtProvider } from "@/context/DebtContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <DebtProvider>{children}</DebtProvider>;
}
