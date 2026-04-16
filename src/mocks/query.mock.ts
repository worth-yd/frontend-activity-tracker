import { CustomerQueryResponse } from "@/types/debt";

export const queryMock: CustomerQueryResponse = {
  fullName: "Ahmet Yılmaz",
  accountCount: 2,
  totalDebt: 2340.5,
  inLegalProc: true,
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
    {
      accountId: 1002,
      encryptedAccountId: "enc_1002",
      currentDebt: 0,
      currentHolding: 320.5,
      invoices: [
        { invoiceNumber: "INV-2024-003", amount: 320.5, expiryDate: "2024-05-01" },
      ],
    },
  ],
  legalFiles: [
    {
      fileNumber: "YTS-2024-0042",
      totalDebt: 1090.5,
      totalHolding: 0,
      coNumber: "CO-8821",
      hasChangeOrder: true,
      encryptedAccountCode: "enc_acc_042",
      accounts: [{ accountCode: "ACC-042" }],
    },
  ],
};
