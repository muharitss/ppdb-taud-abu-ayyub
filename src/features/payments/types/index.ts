export interface SubmitPaymentProofParams {
  registrationNumber: string;
  accessCode: string;
  file: File;
}

export interface SubmitPaymentProofResponse {
  success: boolean;
  status: "payment_submitted";
  registration_status?: "awaiting_form";
  message: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
}
