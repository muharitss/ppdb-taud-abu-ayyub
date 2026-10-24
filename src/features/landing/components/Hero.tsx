import React from "react";
import { Link } from "react-router-dom";
import { getSessionCredentials } from "@/lib/sessionCredentials";

const Hero: React.FC = () => {
  const sessionCreds = getSessionCredentials();

  return (
    <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16 md:py-24 overflow-hidden">
      {/* Ornament Background dengan opacity rendah - FIXED */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('/ornamen.png')] bg-red-500" />

      {/* Additional gradient overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80" />

      {/* Content */}
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-2xl md:text-3xl font-arabic mb-4 opacity-90 text-white/95">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            PPDB TAUD SaQu Abu Ayyub TP.2027-2028
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto text-white/90">
            Mencetak generasi beriman, beradab, dan mandiri sejak usia dini!
          </p>
        </div>

        

        {/* Tombol CTA */}
        <div className="flex flex-row flex-nowrap gap-2 sm:gap-4 justify-center items-center mb-8 mt-8 px-12">
          {sessionCreds ? (
            <>
              <Link
                to={`/daftar/formulir/${encodeURIComponent(sessionCreds.registrationNumber)}`}
                className="flex-1 min-w-0 max-w-xs bg-white hover:bg-[var(--color-light)] text-[var(--color-primary)] px-2 sm:px-6 py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-base md:text-lg transition-all duration-300 text-center shadow-lg hover-lift leading-tight break-words"
              >
                Lanjutkan Pendaftaran
              </Link>

              <Link
                to="/daftar"
                className="flex-1 min-w-0 max-w-xs bg-[var(--color-accent)] hover:opacity-90 text-white px-2 sm:px-6 py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-base md:text-lg transition-all duration-300 text-center shadow-lg hover-lift leading-tight"
              >
                Daftar Baru
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/daftar"
                className="flex-1 min-w-0 max-w-xs bg-white hover:bg-[var(--color-light)] text-[var(--color-primary)] px-2 sm:px-6 py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-base md:text-lg transition-all duration-300 text-center shadow-lg hover-lift leading-tight"
              >
                Daftar Sekarang
              </Link>

              <Link
                to="/status"
                className="flex-1 min-w-0 max-w-xs bg-white/15 hover:bg-white/25 border border-white/40 text-white px-2 sm:px-6 py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-base md:text-lg transition-all duration-300 text-center shadow-lg hover-lift leading-tight"
              >
                Cek Status
              </Link>
            </>
          )}
        </div>

        {/* Foto Anak-anak */}
        <div className=" backdrop-blur-sm rounded-2xl p-4 max-w-4xl mx-auto border-white/30 relative z-10">
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
