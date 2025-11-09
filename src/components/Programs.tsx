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
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Materi & Program Kegiatan
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="flex-none w-72 bg-gradient-to-br from-white to-[var(--color-light)] rounded-2xl shadow-lg p-6 border border-[var(--color-light)] hover-lift"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                {index + 1}
              </div>
              <h3 className="text-[var(--color-dark)] font-bold text-lg mb-2">
                {program}
              </h3>
              <p className="text-[var(--color-dark)] text-sm opacity-75">
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