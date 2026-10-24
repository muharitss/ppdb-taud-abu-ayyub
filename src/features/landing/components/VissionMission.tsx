import React from 'react';

const VisionMission: React.FC = () => {

  const vision = "Lembaga Pendidikan Tahfizh Anak Usia Dini yang mampu mencetak generasi penghafal Al-Qur'an dan berakhlak Qur'an";

  const missions = [
    "Menumbuhkan kegemaran dan kebiasaan membaca dan menghafal Al-Qur'an",
    "Membekali amalan praktis sesuai sunnah",
    "Mengentaskan buta huruf Al-Qur'an sejak usia dini",
    "Menanamkan akhlaqul karimah",
    "Menggali & mengembangkan potensi belajar anak"
  ];

  return (
    <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16 md:py-24 overflow-hidden">
      {/* Ornament Background sama seperti Hero */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('/ornamen.png')]"
      />
      
      {/* Additional gradient overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80" />
      
      {/* Content */}
      <div className="container relative mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Visi & Misi
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Visi Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Visi</h3>
            <p className="text-white/90 leading-relaxed text-lg">
              {vision}
            </p>
          </div>
          
          {/* Misi Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Misi</h3>
            <ul className="text-white/90 space-y-3">
              {missions.map((mission, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-white font-bold mr-3">•</span>
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