import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const VisionMission: React.FC = () => {
  const vision =
    "Lembaga Pendidikan Tahfizh Anak Usia Dini yang mampu mencetak generasi penghafal Al-Qur'an dan berakhlak Qur'ani.";

  const missions = [
    "Menumbuhkan kegemaran dan kebiasaan membaca dan menghafal Al-Qur'an sejak dini",
    "Membekali amalan praktis ibadah sesuai dengan tuntunan sunnah Rasulullah ﷺ",
    "Mengentaskan buta huruf Al-Qur'an sejak usia dini dengan metode yang ramah anak",
    "Menanamkan adab islami dan akhlaqul karimah dalam pergaulan sehari-hari",
    "Menggali dan mengembangkan potensi kognitif serta kemandirian anak",
  ];

  return (
    <section id="visi-misi" className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-14 sm:py-18 md:py-24 overflow-hidden scroll-mt-20">
      {/* Ornament Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 bg-[url('/ornamen.png')]"
      />
      
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/85 to-[var(--color-secondary)]/85" />
      
      {/* Content */}
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Visi & Misi
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Arah dan komitmen pendidikan di TAUD SaQu Abu Ayyub
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Visi Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/25 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">
              Visi Kami
            </span>
            <p className="text-white/95 leading-relaxed text-base sm:text-lg font-medium">
              "{vision}"
            </p>
          </div>
          
          {/* Misi Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/25 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">
              Misi Kami
            </span>
            <ul className="space-y-3 sm:space-y-3.5">
              {missions.map((mission, index) => (
                <li key={index} className="flex items-start gap-3 text-white/95 text-sm sm:text-base leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="flex-1">{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
