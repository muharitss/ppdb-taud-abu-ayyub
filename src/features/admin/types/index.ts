export interface PaymentSummary {
  id: string;
  proof_file_path: string;
  uploaded_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  status: "payment_pending" | "payment_submitted" | "payment_verified" | "payment_rejected";
}

export interface RegistrantPaymentItem {
  id: string;
  registration_number: string;
  child_name: string;
  parent_name: string;
  whatsapp_number: string;
  status: string;
  payment_status: "payment_pending" | "payment_submitted" | "payment_verified" | "payment_rejected";
  created_at: string;
  payments: PaymentSummary[];
}

export interface RegistrantDetail {
  id: string;
  registration_number: string;
  child_name: string;
  parent_name: string;
  whatsapp_number: string;
  status: string;
  payment_status: "payment_pending" | "payment_submitted" | "payment_verified" | "payment_rejected";
  review_notes?: string | null;
  created_at: string;
  ppdb_period: string;
  payments: PaymentSummary[];
}

export interface ReviewPaymentParams {
  payment_id: string;
  approved: boolean;
  review_notes?: string;
}

export interface ReviewPaymentResult {
  success: boolean;
  new_status: "payment_verified" | "payment_rejected";
  message: string;
}
