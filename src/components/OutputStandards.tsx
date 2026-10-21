import React from 'react';
import {
  BookOpen,
  Volume2,
  Award,
  Scroll,
  Calculator,
  CheckCircle2,
  HeartHandshake,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

interface StandardItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

const standards: StandardItem[] = [
  {
    title: "Tahsin & Tahaji",
    desc: "Belajar Al-Qur'an dengan Kitab At-Tibyan melalui Metode Tahaji & Kitab Aisar.",
    icon: BookOpen,
  },
  {
    title: "Tartil Tajwid",
    desc: "Mampu membaca Al-Qur'an dengan tartil sesuai kaidah tajwid, sifat, & makharijul huruf.",
    icon: Volume2,
  },
  {
    title: "Tahfidz Juz 30",
    desc: "Hafalan Al-Qur'an Juz 30 (Juz 'Amma) tuntas dan mutqin sebelum kelulusan.",
    icon: Award,
  },
  {
    title: "Hadits & Doa Sunnah",
    desc: "Hafal hadits-hadits pilihan, do'a harian, dan dzikir sunnah sesuai tuntunan Rasulullah ﷺ.",
    icon: Scroll,
  },
  {
    title: "Calistung Dasar",
    desc: "Tuntas dasar membaca, menulis, dan berhitung sebagai kesiapan masuk jenjang SD.",
    icon: Calculator,
  },
  {
    title: "Praktik Ibadah",
    desc: "Menguasai praktik tata cara wudhu, sholat, dan terbiasa mengamalkannya mandiri.",
    icon: CheckCircle2,
  },
  {
    title: "Adab & Akhlak Islami",
    desc: "Memiliki adab dan akhlak mulia dalam bersosialisasi dengan orang tua, guru, dan sesama.",
    icon: HeartHandshake,
  },
  {
    title: "Kemandirian Santri",
    desc: "Mandiri, disiplin, dan bertanggung jawab dalam menjalankan aktivitas harian.",
    icon: UserCheck,
  },
];

const GraduateStandards: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14 sm:py-18 md:py-20 border-y border-slate-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-primary)] tracking-tight">
            Standar Output Kelulusan
          </h2>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
          {standards.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/40 transition-all duration-300 flex sm:flex-col items-start gap-3.5 sm:gap-4"
              >
                {/* Icon & Index Badge */}
                <div className="sm:w-full flex sm:items-center sm:justify-between shrink-0">
                  <Icon className="w-8 h-8 text-[var(--color-primary)]" />
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-300 font-mono">
                    0{index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
                    <h3 className="font-bold text-[var(--color-dark)] text-sm sm:text-base group-hover:text-[var(--color-primary)] transition-colors">
                      {item.title}
                    </h3>
                    <span className="sm:hidden text-xs font-bold text-slate-300 font-mono">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GraduateStandards;