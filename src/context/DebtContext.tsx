"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  QueryFormData,
  CustomerQueryResponse,
  AccountDto,
  LegalFileDto,
  InvoiceDto,
  OperationType,
} from "@/types/debt";

export type SelectedItem =
  | { type: "account"; action: "pay" | "refund"; account: AccountDto; tckn: string; invoice?: InvoiceDto }
  | { type: "legal";   action: "pay" | "refund"; file: LegalFileDto;  tckn: string };

interface DebtContextType {
  queryData: QueryFormData | null;
  queryResult: CustomerQueryResponse | null;
  tckn: string;
  operationType: OperationType | null;
  selectedItem: SelectedItem | null;
  isPaymentModalOpen: boolean;
  isRefundModalOpen: boolean;
  setQueryData: (data: QueryFormData) => void;
  setQueryResult: (result: CustomerQueryResponse, tckn: string) => void;
  setOperationType: (op: OperationType) => void;
  openPaymentModal: (item: SelectedItem) => void;
  closePaymentModal: () => void;
  openRefundModal: (item: SelectedItem) => void;
  closeRefundModal: () => void;
  clearAll: () => void;
}

const DebtContext = createContext<DebtContextType | null>(null);

export function DebtProvider({ children }: { children: ReactNode }) {
  const [queryData, setQueryData] = useState<QueryFormData | null>(null);
  const [queryResult, setQueryResultState] = useState<CustomerQueryResponse | null>(null);
  const [tckn, setTckn] = useState<string>("");
  const [operationType, setOperationType] = useState<OperationType | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const setQueryResult = (result: CustomerQueryResponse, tc: string) => {
    setQueryResultState(result);
    setTckn(tc);
  };

  const openPaymentModal = (item: SelectedItem) => {
    setSelectedItem(item);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedItem(null);
    setIsPaymentModalOpen(false);
  };

  const openRefundModal = (item: SelectedItem) => {
    setSelectedItem(item);
    setIsRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setSelectedItem(null);
    setIsRefundModalOpen(false);
  };

  const clearAll = () => {
    setQueryData(null);
    setQueryResultState(null);
    setTckn("");
    setOperationType(null);
    setSelectedItem(null);
    setIsPaymentModalOpen(false);
    setIsRefundModalOpen(false);
  };

  return (
    <DebtContext.Provider
      value={{
        queryData,
        queryResult,
        tckn,
        operationType,
        selectedItem,
        isPaymentModalOpen,
        isRefundModalOpen,
        setQueryData,
        setQueryResult,
        setOperationType,
        openPaymentModal,
        closePaymentModal,
        openRefundModal,
        closeRefundModal,
        clearAll,
      }}
    >
      {children}
    </DebtContext.Provider>
  );
}

export function useDebt() {
  const ctx = useContext(DebtContext);
  if (!ctx) throw new Error("useDebt must be used within DebtProvider");
  return ctx;
}
