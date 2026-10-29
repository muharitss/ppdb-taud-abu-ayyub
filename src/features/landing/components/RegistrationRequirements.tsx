import React from "react";
import { Link } from "react-router-dom";
import { getSessionCredentials, getResumeUrl } from "@/lib/sessionCredentials";

const RegistrationRequirements: React.FC = () => {
  const sessionCreds = getSessionCredentials();

  const ctaLink = sessionCreds ? getResumeUrl(sessionCreds) : "/daftar";
  const ctaText = sessionCreds ? "Lanjutkan Pendaftaran" : "Daftar Sekarang";

  const investment = [
    "Uang pendaftaran Rp.300.000,-",
    "Seragam siswa 3 stell",
    "1 set kitab tibyan/kitab aisar, buku panduan Aism, dan Modul pembelajaran siswa",
    "Perlengkapan pembelajaran siswa selama 1 tahun",
    "SPP Bulan Juli Rp.350.000/Bulan",
  ];

  const administrative = [
    "Membayar biaya pendaftaran Rp300.000",
    "Mengisi formulir online / offline secara lengkap",
    "Fotokopi Akta Kelahiran (1 lembar)",
    "Fotokopi Kartu Keluarga (1 lembar)",
    "Pas Foto 3x4 latar belakang merah (2 lembar)",
  ];

  const nonAdministrative = [
    "Usia minimal 3 tahun 6 bulan saat tahun ajaran baru",
    "Mampu memahami instruksi lisan sederhana",
    "Telah lulus dan mandiri dalam toilet training",
    "Dapat melafalkan huruf dan kata dengan jelas",
    "Orang tua siap bekerja sama dalam proses pendidikan siswa",
    "Siap berkomitmen penuh selama masa pendidikan di TAUD",
  ];

  return (
    <section
      id="syarat"
      className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-14 sm:py-18 md:py-24 overflow-hidden scroll-mt-20"
    >
      {/* Ornament Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-25 bg-[url('/ornamen.png')]" />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/85 to-[var(--color-secondary)]/85" />

      <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Biaya & Syarat Pendaftaran
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Informasi investasi pendidikan, berkas administrasi, dan kriteria
            kesiapan calon siswa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {/* Investasi Pendidikan */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-lg border border-white/25 relative z-10 flex flex-col">
            <div className="text-center mb-5 pb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Investasi Pendidikan
              </h3>
              <div className="mt-2 inline-block bg-white/20 text-amber-200 font-extrabold text-lg sm:text-xl px-4 py-1 rounded-xl border border-white/20">
                Rp 3.300.000,-
              </div>
              <p className="text-xs text-white/80 mt-2 font-medium">
                Biaya sudah termasuk (Include):
              </p>
            </div>
            <div className="divide-y divide-white/15 flex-1">
              {investment.map((item, index) => (
                <div
                  key={item}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg tracking-wider select-none mt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-white/95 text-xs sm:text-sm md:text-base leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Administrasi */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-lg border border-white/25 relative z-10 flex flex-col">
            <div className="text-center mb-5 pb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Persyaratan Administrasi
              </h3>
              <div className="mt-2 inline-block text-white/90 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-xl">
                Kelengkapan Berkas
              </div>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Dokumen yang perlu disiapkan:
              </p>
            </div>
            <div className="divide-y divide-white/15 flex-1">
              {administrative.map((item, index) => (
                <div
                  key={item}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg tracking-wider select-none mt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-white/95 text-xs sm:text-sm md:text-base leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Non Administrasi */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-lg border border-white/25 relative z-10 flex flex-col">
            <div className="text-center mb-5 pb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Kriteria Kesiapan Siswa
              </h3>
              <div className="mt-2 inline-block text-white/90 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-xl">
                Kesiapan Calon Siswa
              </div>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Kemandirian & perkembangan anak:
              </p>
            </div>
            <div className="divide-y divide-white/15 flex-1">
              {nonAdministrative.map((item, index) => (
                <div
                  key={item}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
                >
                  <span className="shrink-0 font-mono text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded-lg tracking-wider select-none mt-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-white/95 text-xs sm:text-sm md:text-base leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10 sm:mt-12 relative z-10">
          <Link
            to={ctaLink}
            className="inline-flex items-center justify-center bg-white hover:bg-orange-50 text-[var(--color-primary)] px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl active:translate-y-0"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegistrationRequirements;
