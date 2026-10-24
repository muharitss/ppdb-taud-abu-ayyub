import React from "react";

interface StandardItem {
  title: string;
  desc: string;
}

const standards: StandardItem[] = [
  {
    title: "Tahsin & Tahaji",
    desc: "Belajar Al-Qur'an dengan Kitab At-Tibyan melalui Metode Tahaji & Kitab Aisar.",
  },
  {
    title: "Tartil Tajwid",
    desc: "Mampu membaca Al-Qur'an dengan tartil sesuai kaidah tajwid, sifat, & makharijul huruf.",
  },
  {
    title: "Tahfidz Juz 30",
    desc: "Hafalan Al-Qur'an Juz 30 (Juz 'Amma) tuntas dan mutqin sebelum kelulusan.",
  },
  {
    title: "Hadits & Doa Sunnah",
    desc: "Hafal hadits-hadits pilihan, do'a harian, dan dzikir sunnah sesuai tuntunan Rasulullah ﷺ.",
  },
  {
    title: "Calistung Dasar",
    desc: "Tuntas dasar membaca, menulis, dan berhitung sebagai kesiapan masuk jenjang SD.",
  },
  {
    title: "Praktik Ibadah",
    desc: "Menguasai praktik tata cara wudhu, sholat, dan terbiasa mengamalkannya mandiri.",
  },
  {
    title: "Adab & Akhlak Islami",
    desc: "Memiliki adab dan akhlak mulia dalam bersosialisasi dengan orang tua, guru, dan sesama.",
  },
  {
    title: "Kemandirian Siswa",
    desc: "Mandiri, disiplin, dan bertanggung jawab dalam menjalankan aktivitas harian.",
  },
];

const GraduateStandards: React.FC = () => {
  const groups = [standards.slice(0, 4), standards.slice(4, 8)];

  return (
    <section
      id="standar-kelulusan"
      className="bg-gradient-to-b from-slate-50 to-white py-14 sm:py-18 md:py-20 border-y border-slate-100 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Standar Output Kelulusan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Kompetensi keagamaan, adab, dan kemandirian yang dicapai siswa
            selama menempuh pendidikan.
          </p>
        </div>

        {/* 2 Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 divide-y divide-slate-100"
            >
              {group.map((item, idx) => {
                const itemNumber = groupIndex * 4 + idx + 1;
                return (
                  <div
                    key={item.title}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4"
                  >
                    <span className="shrink-0 font-mono text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg mt-0.5 tracking-wider select-none">
                      {String(itemNumber).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GraduateStandards;
