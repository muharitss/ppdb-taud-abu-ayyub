import React from "react";

const Programs: React.FC = () => {
  const programs = [
    { title: "At-Tibyan (Metode Mesir)", desc: "Metode bertahap belajar membaca Al-Qur'an dari dasar hingga fasih." },
    { title: "Kitab Aisar (Private Class)", desc: "Bimbingan intensif membaca huruf hijaiyyah dengan kaidah tajwid yang benar." },
    { title: "Tahfizh & Muraja'ah Kuat", desc: "Penghafalan Juz 30 dengan sistem pengulangan berkala agar hafalan melekat kuat." },
    { title: "Aqidah & Akhlak Sunnah", desc: "Pengenalan dasar aqidah shahihah, hafalan hadits pilihan, do'a, dan dzikir harian." },
    { title: "Praktik Ibadah Sehari-hari", desc: "Pembiasaan wudhu mandiri, shalat berjamaah, dan doa dalam berbagai aktivitas." },
    { title: "Adab & Karakter Qur'ani", desc: "Penanaman adab menghormati orang tua, guru, teman, dan adab terhadap Al-Qur'an." },
    { title: "Outing Class & Aktivitas Motorik", desc: "Kegiatan luar ruangan: pengenalan alam, olahraga sunnah, kebun sayur, dan kemandirian." },
  ];

  return (
    <section id="program" className="bg-gradient-to-b from-slate-50 to-white py-14 sm:py-18 md:py-20 border-y border-slate-100 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Materi & Program Kegiatan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Kurikulum komprehensif yang memadukan pengajaran Al-Qur'an dan kegiatan pendukung yang menyenangkan.
          </p>
        </div>

        {/* 1 Card Layout */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 divide-y divide-slate-100">
            {programs.map((program, index) => (
              <div
                key={program.title}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start sm:items-center gap-3.5 sm:gap-4"
              >
                <span className="shrink-0 font-mono text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg tracking-wider select-none mt-0.5 sm:mt-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                    {program.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {program.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
