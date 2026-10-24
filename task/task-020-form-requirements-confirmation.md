# Task 020 — Form Requirements Confirmation

## Status
DONE

## Priority
P0

## Dependencies
- Task 005 — Database Schema Review

## Objective
Confirm official full registration form fields and required documents with the school before implementation begins.

## Context
The full registration form fields (child data, parent data, medical info, required documents, etc.) must follow the official school requirements for TAUD SaQu Abu Ayyub TP.2027-2028. Requirements were confirmed by the school (TP.2027/2028 form, received 2026-10-21). Tasks 021–024 are now unblocked.

## Confirmed Fields

### Biaya Pendaftaran
- **Rp 300.000** via Bank BSI
- No. Rek: **7216959997** a.n. TAUD SaQu Abu Ayyub
- Konfirmasi WA: **0821-6959-9979** (Ummu Rumi) / **0813-6707-4138** (Admin)

### Section 1 — Data Calon Peserta Didik
| Field | Type | Required |
|---|---|---|
| Nama lengkap | text | ✅ |
| Nama panggilan | text | ✅ |
| NIK | text (16 digit) | ✅ |
| Tempat lahir | text | ✅ |
| Tanggal lahir | date | ✅ |
| Jenis kelamin | enum: `laki_laki` / `perempuan` | ✅ |
| Anak ke- | integer ≥ 1 | ✅ |
| Jumlah saudara kandung | integer ≥ 0 | ✅ |
| Alamat lengkap | text (multiline) | ✅ |
| Program pembelajaran | enum: `1_tahun` / `2_tahun` | ✅ |

### Section 2 — Data Ayah
| Field | Type | Required |
|---|---|---|
| Nama lengkap | text | ✅ |
| NIK | text (16 digit) | ✅ |
| Tempat/tanggal lahir | text + date | ✅ |
| Pendidikan terakhir | text | ✅ |
| Pekerjaan | text | ✅ |
| Penghasilan per bulan | text | ❌ opsional |
| Nomor HP/WhatsApp | text (international format) | ✅ |
| Alamat | text (multiline) | ✅ |

### Section 3 — Data Ibu
| Field | Type | Required |
|---|---|---|
| Nama lengkap | text | ✅ |
| NIK | text (16 digit) | ✅ |
| Tempat/tanggal lahir | text + date | ✅ |
| Pendidikan terakhir | text | ✅ |
| Pekerjaan | text | ✅ |
| Penghasilan per bulan | text | ❌ opsional |
| Nomor HP/WhatsApp | text (international format) | ✅ |
| Alamat | text (multiline) | ✅ |

### Section 4 — Data Kesehatan Anak
| Field | Type | Required |
|---|---|---|
| Berat badan (kg) | decimal | ✅ |
| Tinggi badan (cm) | decimal | ✅ |
| Golongan darah | enum: `A`/`B`/`AB`/`O`/`tidak_diketahui` | ❌ opsional |
| Riwayat alergi | text | ❌ opsional |
| Riwayat penyakit tertentu | text | ❌ opsional |

### Section 5 — Upload Dokumen
| Dokumen | Format | Required |
|---|---|---|
| Foto Kartu Keluarga (KK) | JPEG, PNG, PDF ≤ 5 MB | ✅ |
| Foto Akte Kelahiran anak | JPEG, PNG, PDF ≤ 5 MB | ✅ |

### Section 6 — Grup WhatsApp
Setelah semua data ter-upload, wali murid diarahkan untuk bergabung ke grup WA via link:
`https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh`

## PPDB Period
- **TP. 2027/2028** (periode ini; update `ppdb_config` sebelum go-live)

## Draft / Save Feature
- **Ya** — simpan per-section (step-by-step wizard); data tidak hilang jika halaman di-refresh.

## Gating: Bukti Transfer (Simplified Flow)
- Alur pendaftaran: tampilkan keterangan membayar biaya pendaftaran ke nomor rekening, akses ke nomor WhatsApp Admin untuk bantuan & pertanyaan, dan upload foto bukti pembayaran -> **langsung bisa mengakses halaman formulir** (`status = awaiting_form` begitu `payment_status = payment_submitted`).
- Formulir tidak perlu menunggu verifikasi admin terlebih dahulu untuk diisi.
- Jika `payment_status = payment_pending` atau `payment_rejected`, halaman formulir menampilkan instruksi pembayaran, tombol bantuan WA Admin, dan form upload bukti pembayaran yang langsung membuka formulir setelah diunggah.

## Scope
- Gather official list of form fields for registration (child data, parent data, guardian info, medical info, etc.)
- Gather official list of required documents (akte kelahiran, KK, foto, sertifikat, etc.) with exact specifications (format, size, resolution)
- Confirm any special validation rules (minimum age, photo specs, file formats)
- Confirm whether a draft/save feature is needed for the form
- Update `specs/01-requirements.md` with confirmed fields
- Update `specs/04-data-model.md` with confirmed `registration_form_data` and `registration_documents` schema
- Unblock tasks 021–023

## Out of Scope
- Implementation of the form (task 022)
- Database migration (task 021)
- Document upload Edge Function (task 023)

## Specifications
- specs/01-requirements.md (to be updated)
- specs/04-data-model.md (to be updated)

## Implementation Plan
1. Prepare list of questions for school admin/stakeholder
2. Schedule meeting or collect requirements via WhatsApp/document
3. Document confirmed fields in `specs/01-requirements.md`
4. Update `specs/04-data-model.md`:
   - `registration_form_data` JSON schema or separate columns
   - `registration_documents` table with document type enum
5. Get sign-off from stakeholder
6. Update task 021, 022, 023 with confirmed scope
7. Mark this task as DONE

## Files Expected to Change
- `specs/01-requirements.md`
- `specs/04-data-model.md`

## Security Considerations
N/A — this is a requirements gathering task. Ensure any shared documents with the school are handled securely.

## Acceptance Criteria
- [ ] Official field list confirmed by school stakeholder and documented in `specs/01-requirements.md`
- [ ] Official document list confirmed with exact specs (format, max size)
- [ ] Special validation rules documented (age minimum, photo requirements, etc.)
- [ ] Draft/save feature decision confirmed (yes/no)
- [ ] `specs/04-data-model.md` updated with confirmed `registration_form_data` schema
- [ ] `specs/04-data-model.md` updated with confirmed `registration_documents` schema
- [ ] Tasks 021, 022, 023 unblocked and updated with confirmed scope

## Verification
```bash
# Check that specs are updated
cat specs/01-requirements.md
cat specs/04-data-model.md
```

## Risks
- **CRITICAL PATH**: This task blocks Phase 6 entirely. Delay here delays go-live.
- School may change requirements after initial confirmation — build schema to be flexible

## Deliverables
- Updated `specs/01-requirements.md`
- Updated `specs/04-data-model.md`
- Stakeholder sign-off (documented or screenshot of approval)

## Completion Notes
Requirements confirmed by school (TP.2027/2028 official form, 2026-10-21). All fields, documents, WA group link, and gating rule documented above. Tasks 021–024 unblocked.
