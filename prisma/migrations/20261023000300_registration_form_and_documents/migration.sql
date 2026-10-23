-- Migration: Registration form data, registration documents, and document_type enum
-- Task: Task 021
-- Specs: specs/04-data-model.md (Sections 3.4, 3.5, 7, 8, 9), task/task-020-form-requirements-confirmation.md

-- 1. Create document_type enum
CREATE TYPE "document_type" AS ENUM ('kartu_keluarga', 'akte_kelahiran', 'pas_foto');

-- 2. Create registration_documents table
CREATE TABLE "registration_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID NOT NULL,
    "document_type" "document_type" NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_documents_pkey" PRIMARY KEY ("id")
);

-- 3. Create registration_form_data table
CREATE TABLE "registration_form_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID NOT NULL,
    "form_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_form_data_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes and Constraints
CREATE UNIQUE INDEX "registration_documents_registration_id_document_type_key" ON "registration_documents"("registration_id", "document_type");
CREATE INDEX "idx_reg_docs_registration_id" ON "registration_documents"("registration_id");

CREATE UNIQUE INDEX "idx_form_data_registration_id" ON "registration_form_data"("registration_id");

-- 5. Foreign Key Constraints
ALTER TABLE "registration_documents" ADD CONSTRAINT "registration_documents_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "registration_form_data" ADD CONSTRAINT "registration_form_data_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Updated_at Trigger for registration_form_data
CREATE TRIGGER trg_form_data_updated_at
  BEFORE UPDATE ON "registration_form_data"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE "registration_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registration_form_data" ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default.
-- Authenticated admins can view all uploaded documents and form data.
CREATE POLICY "admins_select_registration_documents" ON "registration_documents"
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admins_select_registration_form_data" ON "registration_form_data"
  FOR SELECT TO authenticated
  USING (public.is_admin());
