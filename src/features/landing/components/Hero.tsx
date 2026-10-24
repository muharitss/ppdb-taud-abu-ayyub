import React from "react";
import { Link } from "react-router-dom";
import { getSessionCredentials } from "@/lib/sessionCredentials";

const Hero: React.FC = () => {
  const sessionCreds = getSessionCredentials();

  return (
    <section
      id="hero"
      className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-14 sm:py-20 md:py-24 overflow-hidden"
    >
      {/* Ornament Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-25 bg-[url('/ornamen.png')]" />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/85 to-[var(--color-secondary)]/85" />

      {/* Content */}
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xl sm:text-2xl md:text-3xl font-arabic mb-3 text-white/95 select-none tracking-wide">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight max-w-4xl mx-auto">
            PPDB TAUD SaQu Abu Ayyub
            <span className="block text-lg sm:text-2xl md:text-3xl font-semibold text-amber-200 mt-2">
              Tahun Pelajaran 2027/2028
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-normal text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed">
            Mencetak generasi beriman, beradab, dan mandiri sejak usia dini!
          </p>
        </div>

        {/* Tombol CTA */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 max-w-md mx-auto w-full px-4 sm:px-0">
          {sessionCreds ? (
            <>
              <Link
                to={`/daftar/formulir/${encodeURIComponent(sessionCreds.registrationNumber)}`}
                className="w-full sm:w-auto min-w-[200px] bg-white hover:bg-orange-50 text-[var(--color-primary)] px-6 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 text-center shadow-lg"
              >
                Lanjutkan Pendaftaran
              </Link>

              <Link
                to="/daftar"
                className="w-full sm:w-auto min-w-[180px] bg-white/15 hover:bg-white/25 border border-white/40 text-white px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 text-center shadow-sm "
              >
                Daftar Siswa Baru
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/daftar"
                className="w-full sm:w-auto min-w-[200px] bg-white hover:bg-orange-50 text-[var(--color-primary)] px-6 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Daftar Sekarang
              </Link>

              <Link
                to="/status"
                className="w-full sm:w-auto min-w-[180px] bg-white/15 hover:bg-white/25 border border-white/40 text-white px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 text-center shadow-sm hover:shadow-md backdrop-blur-xs hover:-translate-y-0.5 active:translate-y-0"
              >
                Cek Status
              </Link>
            </>
          )}
        </div>

        {/* Foto Anak-anak */}
        <div className="backdrop-blur-sm rounded-2xl p-2.5 sm:p-4 max-w-4xl mx-auto ">
          <div className="h-60 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-white/20">
            <img
              className="w-full h-full object-cover rounded-xl"
              src="/anak-anak.png"
              alt="Siswa TAUD SaQu Abu Ayyub"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
