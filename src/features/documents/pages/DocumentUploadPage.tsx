import React from 'react';

// Route: /dokumen (Document Upload Page placeholder)
export const DocumentUploadPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Upload Dokumen</h1>
        <p className="text-gray-600">Halaman upload berkas santri baru sedang disiapkan.</p>
      </div>
    </div>
  );
};

export default DocumentUploadPage;
