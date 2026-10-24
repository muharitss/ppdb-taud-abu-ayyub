import React from "react";

const Programs: React.FC = () => {
  const programs = [
    "At-Tibyan (metode Mesir)",
    "Kitab Aisar (privat class)",
    "Tahfizh dengan muraja'ah kuat",
    "Aqidah & Akhlak – hadits, dzikir & do'a",
    "Praktik ibadah sehari-hari",
    "Adab Qur'ani",
    "Outing class (olahraga, kebun sayur, dll)",
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14 sm:py-18 md:py-20 border-y border-slate-100">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-primary)] tracking-tight">
            Materi & Program Kegiatan
          </h2>
        </div>

        {/* 1 Card Layout */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl pt-6 pb-6 pr-4 pl-4 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 divide-y divide-slate-100">
            {programs.map((program, index) => (
              <div
                key={program}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
              >
                <span className="shrink-0 font-mono text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg tracking-wider select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold text-slate-800 text-base">
                  {program}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
