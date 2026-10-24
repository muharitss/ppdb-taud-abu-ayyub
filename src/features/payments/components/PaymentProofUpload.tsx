import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentProofUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null, error?: string | null) => void;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  selectedFile,
  onFileSelect,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const isImage =
      selectedFile.type.startsWith("image/") ||
      /\.(jpg|jpeg|png)$/i.test(selectedFile.name);

    if (isImage) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const validateAndSetFile = (file: File) => {
    // 1. Check size
    if (file.size > MAX_SIZE_BYTES) {
      onFileSelect(null, "Ukuran berkas melebihi 5MB. Silakan kompres atau pilih berkas lain.");
      return;
    }

    // 2. Check extension & mime
    const nameLower = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      onFileSelect(null, "Format berkas tidak didukung. Harap unggah berkas JPG, PNG, atau PDF.");
      return;
    }

    onFileSelect(file, null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/50"
              : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-700">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">
                Pilih atau seret berkas bukti transfer ke sini
              </p>
              <p className="text-xs text-slate-500">
                Mendukung JPG, PNG, atau PDF (maksimal 5MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="mt-2 text-xs"
            >
              Cari Berkas
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg flex-shrink-0">
                {selectedFile.type === "application/pdf" ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "Dokumen"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Hapus berkas</span>
            </Button>
          </div>

          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white max-h-56 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Pratinjau Bukti Transfer"
                className="max-h-56 object-contain w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default PaymentProofUpload;
