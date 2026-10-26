import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGES: string[] = [
  "/kegiatan-1.jpg",
  "/kegiatan-2.jpg",
  "/kegiatan-3.jpg",
  "/kegiatan-4.jpg",
  "/kegiatan-5.jpg",
  "/kegiatan-6.jpg",
  "/kegiatan-7.jpg",
  "/kegiatan-8.jpg",
  "/kegiatan-9.jpg",
  "/kegiatan-10.jpg",
  "/kelas.jpg",
  "/kegiatan-11.jpg",
  "/kegiatan-12.jpg",
  "/kegiatan-13.jpg",
  "/WhatsApp Image 2026-10-25 at 15.54.27.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.56.09.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.56.33.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.57.22 (1).jpeg",
  "/WhatsApp Image 2026-10-25 at 15.57.22.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.57.23 (1).jpeg",
  "/WhatsApp Image 2026-10-25 at 15.57.23.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.57.24.jpeg",
  "/WhatsApp Image 2026-10-25 at 15.58.03.jpeg",
  "/WhatsApp Image 2026-10-25 at 16.03.20.jpeg",
  "/WhatsApp Image 2026-10-25 at 16.03.21 (1).jpeg",
  "/WhatsApp Image 2026-10-25 at 16.03.21.jpeg",
  "/WhatsApp Image 2026-10-25 at 16.24.09.jpeg",
  "/WhatsApp Image 2026-10-25 at 16.24.10.jpeg",
  "/WhatsApp Image 2026-10-25 at 16.24.11.jpeg",
  "/WhatsApp Image 2026-10-25 at 17.34.49.jpeg",
  "/WhatsApp Image 2026-10-25 at 17.34.50 (1).jpeg",
  "/WhatsApp Image 2026-10-25 at 17.34.50.jpeg",
];

// Indeks foto yang dijadikan ukuran besar (2x2) agar membentuk Featured Image Grid yang rata tanpa celah kosong
const FEATURED_INDICES = new Set([0, 11, 18, 29]);
const INITIAL_COUNT = 5; // 1 foto (2x2) + 8 foto (1x1) = 12 sel (pas 3 baris di 4 kolom / 6 baris di 2 kolom)

const Documentation: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const visibleImages = showAll ? IMAGES : IMAGES.slice(0, INITIAL_COUNT);

  const handleToggleShowAll = () => {
    if (showAll) {
      setShowAll(false);
      requestAnimationFrame(() => {
        toggleButtonRef.current?.scrollIntoView({
          // behavior: "smooth",
          block: "center",
        });
      });
    } else {
      setShowAll(true);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + IMAGES.length) % IMAGES.length : null,
    );
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % IMAGES.length : null,
    );
  };

  return (
    <section
      id="dokumentasi"
      className="bg-white py-14 sm:py-18 md:py-20 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Dokumentasi Kegiatan & Fasilitas
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Potret aktivitas pembelajaran, sarana belajar, dan kebersamaan siswa-siswi
            di TAUD SaQu Abu Ayyub.
          </p>
        </div>

        {/* Seamless Featured Image Grid (Tanpa Gap & Tanpa Border Radius) */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-0">
          {visibleImages.map((src, index) => {
            const isFeatured = FEATURED_INDICES.has(index);
            const isRightFeatured = index === 11 || index === 29;

            return (
              <button
                key={src}
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Lihat dokumentasi ${index + 1}`}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-none bg-slate-100 p-0 border-0 focus:outline-none cursor-pointer",
                  isFeatured && "col-span-2 row-span-2",
                  isRightFeatured && "md:col-start-3",
                )}
              >
                <img
                  src={src}
                  alt={`Dokumentasi TAUD SaQu Abu Ayyub ${index + 1}`}
                  loading={index < INITIAL_COUNT ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Toggle Show More / Less */}
        <div className="mt-8 text-center">
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={handleToggleShowAll}
            className="inline-flex items-center justify-center border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm active:translate-y-0 cursor-pointer"
          >
            {showAll
              ? "Tampilkan Lebih Sedikit"
              : `Lihat Semua Foto (${IMAGES.length})`}
          </button>
        </div>
      </div>

      {/* Minimalist Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup pratinjau"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            type="button"
            onClick={showPrev}
            aria-label="Foto sebelumnya"
            className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2 bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <img
            src={IMAGES[lightboxIndex]}
            alt={`Dokumentasi ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[90vw] object-contain select-none"
          />

          <button
            type="button"
            onClick={showNext}
            aria-label="Foto selanjutnya"
            className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2 bg-black/40 hover:bg-black/60 cursor-pointer"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Documentation;
