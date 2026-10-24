import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationRequirements: React.FC = () => {
  const administrative = [
    "Membayar biaya pendaftaran Rp300.000",
    "Mengisi formulir online/offline",
    "Fotokopi Akte (1)",
    "Fotokopi KK (1)",
    "Pas Foto 3x4 merah (2)"
  ];

  const nonAdministrative = [
    "Usia minimal 3 tahun 6 bulan",
    "Mampu memahami instruksi",
    "Lulus toilet training",
    "Jelas melafalkan huruf",
    "Orang tua siap bekerja sama",
    "Siap berkomitmen selama masa pendidikan TAUD"
  ];

  return (
    <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16 md:py-24 overflow-hidden">
      {/* Ornament Background sama seperti Visi Misi / Hero */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('/ornamen.png')]"
      />
      
      {/* Additional gradient overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80" />

      <div className="container relative mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 tracking-tight">
          Syarat Pendaftaran
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Administrasi */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/30 relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
              Administrasi
            </h3>
            <div className="divide-y divide-white/20">
              {administrative.map((item, index) => (
                <div
                  key={item}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-white bg-white/25 px-2.5 py-1 rounded-lg tracking-wider select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-white/95 text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Non Administrasi */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/30 relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
              Non Administrasi
            </h3>
            <div className="divide-y divide-white/20">
              {nonAdministrative.map((item, index) => (
                <div
                  key={item}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-white bg-white/25 px-2.5 py-1 rounded-lg tracking-wider select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-white/95 text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 relative z-10">
          <Link 
            to="/daftar"
            className="inline-block bg-white hover:bg-slate-100 text-[var(--color-primary)] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover-lift"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegistrationRequirements;
