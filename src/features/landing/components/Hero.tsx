import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16 md:py-24 overflow-hidden">
      {/* Ornament Background dengan opacity rendah - FIXED */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('/ornamen.png')] bg-red-500"
      />
      
      {/* Additional gradient overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80" />
      
      {/* Content */}
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-2xl md:text-3xl font-arabic mb-4 opacity-90 text-white/95">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Telah dibuka PPDB TAUD SaQu Abu Ayyub TP.2026-2027
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto text-white/90">
            Mencetak generasi beriman, beradab, dan mandiri sejak usia dini!
          </p>
        </div>

        {/* Tombol CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-[var(--color-light)] text-[var(--color-primary)] px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto text-center shadow-lg hover-lift z-10"
          >
            Daftar Sekarang
          </a>
          <a 
            href="https://wa.me/6282169599979"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-accent)] hover:opacity-90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto text-center shadow-lg hover-lift z-10"
          >
            Hubungi via WhatsApp
          </a>
        </div>

        {/* Foto Anak-anak */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-4xl mx-auto border border-white/30 relative z-10">
          <div className="bg-white/30 h-64 md:h-80 rounded-xl flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover rounded-xl" 
              src="/anak-anak.png" 
              alt="Anak-anak TAUD SaQu" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;