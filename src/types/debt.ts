// ─── Form ────────────────────────────────────────────────────────────────────

export interface QueryFormData {
  tc: string;
  anaAdi: string;
  babaAdi: string;
  dogumYeri: string;
  dogumTarihi: string; // YYYY-MM-DD
}

// ─── API: Standart zarf ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  transactionId?: string;
  message?: string;
  data: T;
}

// ─── Müşteri Sorgulama Response ───────────────────────────────────────────────

export interface InvoiceDto {
  invoiceNumber: string;
  amount: number;
  expiryDate: string;
  status?: string;
}

export interface AccountDto {
  accountId: number;
  encryptedAccountId: string;
  /** Borç tutarı — pozitif → ödeme yapılacak */
  currentDebt: number;
  /** Alacak/iade tutarı — pozitif → iade alınacak */
  currentHolding: number;
  hasChangeOrder?: boolean;
  invoices: InvoiceDto[];
}

export interface LegalAccountDto {
  /** String olarak gelir — backend'e ytsAccounts olarak virgülle birleşik gönderilir */
  accountCode: string;
}

export interface LegalFileDto {
  fileNumber: string;
  totalDebt: number;
  totalHolding: number;
  coNumber: string;
  hasChangeOrder: boolean;
  encryptedAccountCode: string;
  accounts: LegalAccountDto[];
}

export interface CustomerQueryResponse {
  fullName: string;
  accountCount: number;
  accounts: AccountDto[];
  legalFiles: LegalFileDto[];
  totalDebt: number;
  inLegalProc: boolean;
  encryptedTckn: string;
}

// ─── e-Devlet Token Response ──────────────────────────────────────────────────

export type OperationType =
  | "QUERY"
  | "PAYMENT"
  | "REFUND"
  | "LEGAL_PAYMENT"
  | "LEGAL_REFUND";

export interface TokenQueryResponse {
  tckn: string;
  accountCode: number;
  encryptedTckn: string;
  encryptedAccountCode: string;
  operationType: OperationType;
  queryResult: CustomerQueryResponse;
}

// ─── Ödeme ───────────────────────────────────────────────────────────────────

export type PaymentRefundType = "INVOICE" | "YTS";

export interface CreditCardRequest {
  number: string;          // 16 hane
  expirationMonth: string; // "01"–"12"
  expirationYear: number;  // 4 hane (2025+), backend 2 haneye çevirir
  holder: string;
  securityCode: string;    // 3 hane CVV
  issuer: "Visa" | "Master Kart";
}

export interface PaymentRequest {
  accountCode: number;
  tckn: string;
  amount: number;
  documentNumber: string;
  paymentRefundType: PaymentRefundType;
  creditCard: CreditCardRequest;
  /** YTS ise virgülle ayrılmış hesap kodları */
  ytsAccounts?: string;
  /** e-Devlet token ile geldiyse */
  token?: string;
}

export interface PaymentResponse {
  bankRefId: string;
  bankOrderId: string;
  bankReturnCode: string;
  returnMessage: string;
}

// ─── İade ────────────────────────────────────────────────────────────────────

export interface RefundRequest {
  accountCode: number;
  tckn: string;
  amount: number;
  /** Hesap sahibinin adı — backend Türkçe büyük harf karşılaştırması yapar */
  name: string;
  /** TR prefix olmadan 24 rakam */
  iban: string;
  bankName: string;
  paymentRefundType: PaymentRefundType;
  /** YTS ise dosya numarası */
  fileNumber?: string;
  /** e-Devlet token ile geldiyse */
  token?: string;
}

export interface RefundResponse {
  changeOrderNumber: string;
  returnMessage: string;
}
