import React from "react";

const About: React.FC = () => {
  return (
    <section
      id="tentang"
      className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-14 sm:py-18 md:py-24 overflow-hidden scroll-mt-20"
    >
      {/* Ornament Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-25 bg-[url('/ornamen.png')]" />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/85 to-[var(--color-secondary)]/85" />

      {/* Content */}
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Tentang TAUD SaQu Abu Ayyub
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Lembaga pendidikan anak usia dini berbasis Al-Qur'an dan Sunnah
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-white/25 relative z-10 space-y-4">
            <p className="text-white/95 leading-relaxed text-sm sm:text-base md:text-lg">
              TAUD SaQu adalah salah satu layanan pendidikan di bawah naungan
              Islamic Centre Wadi Mubarak untuk jenjang Pendidikan Anak Usia
              Dini (mulai usia 3,6 tahun). Program unggulan kami mengedepankan{" "}
              <span className="font-semibold text-white">Tahfidzul Qur'an</span>{" "}
              dan{" "}
              <span className="font-semibold text-white">
                Pembiasaan Akhlak Qur'ani
              </span>
              , dengan harapan Al-Qur'an menjadi fondasi utama dalam tumbuh
              kembang anak sejak usia dini.
            </p>

            <p className="text-white/95 leading-relaxed text-sm sm:text-base md:text-lg">
              Dengan kurikulum yang mengintegrasikan adab, hafalan Al-Qur'an,
              dan kesiapan kognitif dasar, TAUD SaQu Abu Ayyub berkomitmen
              melahirkan generasi yang cinta Al-Qur'an dan berakhlak mulia.
            </p>

            <p className="text-white/95 leading-relaxed text-sm sm:text-base md:text-lg">
              Fasilitas yang representatif, asatidzah yang berdedikasi, serta
              lingkungan yang kondusif senantiasa dihadirkan demi mendukung
              proses belajar mengajar yang aman, menyenangkan, dan optimal bagi
              siswa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
