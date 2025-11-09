import React from 'react';

const Programs: React.FC = () => {
  const programs = [
    "At-Tibyan (metode Mesir)",
    "Kitab Aisar (privat class)",
    "Tahfizh dengan muraja'ah kuat",
    "Aqidah & Akhlak – hadits, dzikir & do'a",
    "Praktik ibadah sehari-hari",
    "Adab Qur'ani",
    "Outing class (olahraga, kebun sayur, dll)"
  ];

  return (
    <section className="bg-color-gray py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Materi & Program Kegiatan
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="flex-none w-72 bg-color-white rounded-2xl shadow-lg p-6"
            >
              <div className="w-16 h-16 bg-color-brown rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                {index + 1}
              </div>
              <h3 className="text-color-gray font-bold text-lg mb-2">
                {program}
              </h3>
              <p className="text-color-gray text-sm opacity-75">
                Program unggulan yang dirancang khusus untuk perkembangan anak usia dini
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;