export interface CreateRegistrationRequest {
  child_name: string;
  whatsapp_number: string;
  file: File;
}

export interface CreateRegistrationResponse {
  registration_number: string;
  access_code: string;
  registration_id: string;
}

export interface RegistrationErrorResponse {
  error: string;
}
