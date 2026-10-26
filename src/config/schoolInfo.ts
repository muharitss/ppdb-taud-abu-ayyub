export interface SchoolBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
}

export const SCHOOL_BANK_INFO: SchoolBankInfo = {
  bankName: "Bank Syariah Indonesia (BSI)",
  accountNumber: "7327913322",
  accountHolder: "TAUD Abu Ayyub",
  amount: 300000,
};

export const ADMIN_CONTACTS = {
  primary: {
    name: "Admin PPDB",
    phone: "0813-6707-4138",
    whatsappNumber: "6281367074138",
    whatsappUrl: "https://wa.me/6281367074138",
  },
  secondary: {
    name: "Admin PPDB",
    phone: "0813-6707-4138",
    whatsappNumber: "6281367074138",
    whatsappUrl: "https://wa.me/6281367074138",
  },
  waGroupLink: "https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh",
};
