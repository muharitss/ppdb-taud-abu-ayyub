import React, { useState } from 'react';

const VisionMission: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const vision = "Lembaga Pendidikan Tahfizh Anak Usia Dini yang mampu mencetak generasi penghafal Al-Qur'an dan berakhlak Qur'an";

  const missions = [
    "Menumbuhkan kegemaran dan kebiasaan membaca dan menghafal Al-Qur'an",
    "Membekali amalan praktis sesuai sunnah",
    "Mengentaskan buta huruf Al-Qur'an sejak usia dini",
    "Menanamkan akhlaqul karimah",
    "Menggali & mengembangkan potensi belajar anak"
  ];

  return (
    <section className="bg-color-brown py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Visi & Misi
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-color-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-color-gray mb-4">Visi</h3>
            <p className="text-color-gray leading-relaxed text-lg">
              {vision}
            </p>
          </div>
          
          <div className="bg-color-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-color-gray mb-4">Misi</h3>
            <ul className="text-color-gray space-y-3">
              {missions.slice(0, expanded ? missions.length : 3).map((mission, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-color-blue font-bold mr-3">•</span>
                  {mission}
                </li>
              ))}
            </ul>
            
            {missions.length > 3 && (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="mt-4 bg-color-blue hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300"
              >
                {expanded ? 'Tutup' : 'Lihat Selengkapnya'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;