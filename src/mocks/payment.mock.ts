import { PaymentResponse } from "@/types/debt";

export const paymentMock: PaymentResponse = {
  bankRefId: "REF-MOCK-001",
  bankOrderId: "ORD-MOCK-001",
  bankReturnCode: "00",
  returnMessage: "Ödemeniz başarıyla gerçekleştirildi.",
};
