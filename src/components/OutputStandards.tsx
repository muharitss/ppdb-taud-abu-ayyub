import React from 'react';

const GraduateStandards: React.FC = () => {
  const standards = [
    "Belajar Al Qur'an dengan Kitab At-Tibyan dengan Metode Tahaji & Kitab Aisar.",
    "Mampu membaca Al-Qur'an dengan Tartil (sesuai tajwid, sifat & makharijul hurufnya)",
    "Hafal Al Qur'an Juz 30",
    "Hafal hadits-hadits, do'a dan dzikir pilihan sesuai Al Qur'an & Sunnah",
    "Mampu membaca, menulis dan berhitung (Calistung)",
    "Menguasai praktek ibadah & terbiasa mengamalkannya",
    "Memiliki akhlak & adab Islami terhadap sesama",
    "Mandiri & bertanggung jawab dalam beraktivitas sehari-hari"
  ];

  return (
    <section className="bg-gradient-to-br from-[var(--color-light)] to-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Standar Output Kelulusan
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {standards.map((standard, index) => (
            <div 
              key={index}
              className="flex-none w-80 bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-light)] hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {index + 1}
              </div>
              <p className="text-[var(--color-dark)] leading-relaxed">
                {standard}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--color-primary)] hover:opacity-90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover-lift"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default GraduateStandards;