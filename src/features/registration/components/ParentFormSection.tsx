import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RegistrationFormData } from "../schemas/formSchema";

interface ParentFormSectionProps {
  role: "father" | "mother";
  label: "Ayah" | "Ibu";
  data?: Partial<RegistrationFormData["father"]>;
  errors: Record<string, string>;
  isReadOnly?: boolean;
  onChange: (field: string, value: string) => void;
}

export const ParentFormSection: React.FC<ParentFormSectionProps> = ({
  role,
  label,
  data,
  errors,
  isReadOnly,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${role}_name`}>Nama Lengkap {label} *</Label>
        <Input
          id={`${role}_name`}
          placeholder={`Nama lengkap ${label.toLowerCase()} kandung`}
          value={data?.full_name || ""}
          onChange={(e) => onChange("full_name", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.full_name`] && (
          <p className="text-xs text-destructive">{errors[`${role}.full_name`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_nik`}>NIK {label} (16 Digit) *</Label>
        <Input
          id={`${role}_nik`}
          maxLength={16}
          placeholder={`16 digit NIK ${label.toLowerCase()}`}
          value={data?.nik || ""}
          onChange={(e) => onChange("nik", e.target.value.replace(/\D/g, ""))}
          disabled={isReadOnly}
        />
        {errors[`${role}.nik`] && (
          <p className="text-xs text-destructive">{errors[`${role}.nik`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_wa`}>Nomor WhatsApp {label} *</Label>
        <Input
          id={`${role}_wa`}
          placeholder="08xxxxxxxxxx"
          value={data?.whatsapp_number || ""}
          onChange={(e) => onChange("whatsapp_number", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.whatsapp_number`] && (
          <p className="text-xs text-destructive">{errors[`${role}.whatsapp_number`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_birth_place`}>Tempat Lahir {label} *</Label>
        <Input
          id={`${role}_birth_place`}
          placeholder="Kota / Tempat Lahir"
          value={data?.birth_place || ""}
          onChange={(e) => onChange("birth_place", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.birth_place`] && (
          <p className="text-xs text-destructive">{errors[`${role}.birth_place`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_birth_date`}>Tanggal Lahir {label} *</Label>
        <Input
          id={`${role}_birth_date`}
          type="date"
          value={data?.birth_date || ""}
          onChange={(e) => onChange("birth_date", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.birth_date`] && (
          <p className="text-xs text-destructive">{errors[`${role}.birth_date`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_education`}>Pendidikan Terakhir *</Label>
        <Input
          id={`${role}_education`}
          placeholder="SMA / D3 / S1 / S2 / lainnya"
          value={data?.last_education || ""}
          onChange={(e) => onChange("last_education", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.last_education`] && (
          <p className="text-xs text-destructive">{errors[`${role}.last_education`]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${role}_occupation`}>Pekerjaan {label} *</Label>
        <Input
          id={`${role}_occupation`}
          placeholder={
            role === "father"
              ? "PNS / Swasta / Wiraswasta / lainnya"
              : "Ibu Rumah Tangga / PNS / Swasta / dll"
          }
          value={data?.occupation || ""}
          onChange={(e) => onChange("occupation", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.occupation`] && (
          <p className="text-xs text-destructive">{errors[`${role}.occupation`]}</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${role}_income`}>Penghasilan Bulanan (Opsional)</Label>
        <Input
          id={`${role}_income`}
          placeholder={
            role === "father"
              ? "Contoh: 3.000.000 - 5.000.000"
              : "Contoh: 1.000.000 - 3.000.000"
          }
          value={data?.monthly_income || ""}
          onChange={(e) => onChange("monthly_income", e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${role}_address`}>Alamat Domisili {label} *</Label>
        <Textarea
          id={`${role}_address`}
          rows={3}
          placeholder={`Alamat lengkap tempat tinggal ${label.toLowerCase()} saat ini`}
          value={data?.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
          disabled={isReadOnly}
        />
        {errors[`${role}.address`] && (
          <p className="text-xs text-destructive">{errors[`${role}.address`]}</p>
        )}
      </div>
    </div>
  );
};

export default ParentFormSection;
