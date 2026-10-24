import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const Location: React.FC = () => {
  const mapsUrl = "https://maps.google.com/?q=TAUD+Abu+Ayyub+Duri";

  return (
    <section id="lokasi" className="bg-slate-50 py-14 sm:py-18 md:py-20 border-t border-slate-200/80 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Lokasi Sekolah
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 flex items-center justify-center gap-1.5 flex-wrap">
            <span>Jl. Sakura Gg. Mufakat 3, Kel. Duri Barat, Kec. Mandau, Kab. Bengkalis, Riau</span>
          </p>
        </div>
        
        <div >
          <div className="rounded-xl overflow-hidden aspect-video sm:aspect-auto sm:h-96 w-full bg-slate-100 border shadow-2xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d260.8374199392628!2d101.17622639292253!3d1.2654648909816073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d37bb323733e7d%3A0x3b547048645a2748!2ssekolah%20Sunnah%20dikota%20duri%20TAAUD%20Abu%20Ayyub!5e0!3m2!1sid!2sid!4v1762671180974!5m2!1sid!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }}
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi TAUD SaQu Abu Ayyub"
            />
          </div>
          
          <div className="mt-3 px-2 py-1 flex justify-end">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
