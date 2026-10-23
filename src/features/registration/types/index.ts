export interface CreateRegistrationRequest {
  child_name: string;
  parent_name: string;
  whatsapp_number: string;
}

export interface CreateRegistrationResponse {
  registration_number: string;
  access_code: string;
  registration_id: string;
}

export interface RegistrationErrorResponse {
  error: string;
}
