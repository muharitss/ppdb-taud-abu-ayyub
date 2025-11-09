import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-[var(--color-brown)] islamic-pattern py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-2xl md:text-3xl font-arabic mb-4 opacity-90 text-white">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-orange)] mb-6">
            Telah dibuka PPDB TAUD SaQu Abu Ayyub TP.2026-2027
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto text-white">
            Mencetak generasi beriman, beradab, dan mandiri sejak usia dini!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-blue)] hover:opacity-90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto text-center"
          >
            Daftar Sekarang
          </a>
          <a 
            href="https://wa.me/6282169599979"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-orange)] hover:opacity-90 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-full sm:w-auto text-center"
          >
            Hubungi via WhatsApp
          </a>
        </div>

        <div className="bg-white rounded-2xl p-4 max-w-4xl mx-auto">
          <div className="bg-gray-200 h-64 md:h-80 rounded-xl flex items-center justify-center">
            <span className="text-[var(--color-gray)]">Foto Anak-anak TAUD SaQu</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;