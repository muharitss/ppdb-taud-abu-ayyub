import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DocumentItem } from '../services/adminDetail';
import { FileText, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DocumentViewerProps {
  documents: DocumentItem[];
}

const DOC_TITLES: Record<string, string> = {
  kartu_keluarga: 'Kartu Keluarga (KK)',
  akte_kelahiran: 'Akte Kelahiran',
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
  const docTypes = ['kartu_keluarga', 'akte_kelahiran'] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {docTypes.map((type) => {
        const doc = documents.find((d) => d.document_type === type);
        const title = DOC_TITLES[type] || type;

        return (
          <Card key={type} className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {title}
              </CardTitle>
              {doc?.uploaded_at && (
                <span className="text-[11px] text-slate-400">
                  {new Date(doc.uploaded_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {!doc ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs">Berkas belum diunggah</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doc.signed_url ? (
                    doc.file_path.toLowerCase().endsWith('.pdf') ? (
                      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <FileText className="w-10 h-10 text-red-500 mx-auto" />
                        <p className="text-xs font-medium text-slate-700 truncate max-w-xs mx-auto">
                          {doc.file_path.split('/').pop()}
                        </p>
                        <a href={doc.signed_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs mt-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Buka Dokumen PDF
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img
                            src={doc.signed_url}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex justify-end">
                          <a href={doc.signed_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600">
                              <ImageIcon className="w-3.5 h-3.5" />
                              Buka Foto Penuh
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-xs text-amber-700 bg-amber-50 rounded-lg">
                      Tautan berkas sementara gagal digenerate.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentViewer;
