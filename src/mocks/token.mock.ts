import { TokenQueryResponse } from "@/types/debt";

export const tokenMock: TokenQueryResponse = {
  tckn: "12345678901",
  accountCode: 1001,
  encryptedTckn: "enc_12345678901",
  encryptedAccountCode: "enc_1001",
  operationType: "PAYMENT",
  queryResult: {
    fullName: "Ahmet Yılmaz",
    accountCount: 1,
    totalDebt: 1250.0,
    inLegalProc: false,
    encryptedTckn: "enc_12345678901",
    accounts: [
      {
        accountId: 1001,
        encryptedAccountId: "enc_1001",
        currentDebt: 1250.0,
        currentHolding: 0,
        invoices: [
          { invoiceNumber: "INV-2024-001", amount: 750.0, expiryDate: "2024-06-30" },
          { invoiceNumber: "INV-2024-002", amount: 500.0, expiryDate: "2024-07-15" },
        ],
      },
    ],
    legalFiles: [],
  },
};
