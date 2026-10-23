export interface VerifyAccessRequest {
  registration_number: string;
  access_code: string;
}

export interface VerifyAccessResponse {
  registration_number: string;
  registration_status: string;
  payment_status: string;
  submitted_at: string | null;
  form_completeness: boolean;
}
