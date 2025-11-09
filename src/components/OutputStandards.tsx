import React from 'react';

const OutputStandards: React.FC = () => {
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
    <section className="bg-color-brown py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Standar Output Kelulusan
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {standards.map((standard, index) => (
            <div 
              key={index}
              className="flex-none w-80 bg-color-white rounded-2xl shadow-lg p-6"
            >
              <div className="w-12 h-12 bg-color-blue rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {index + 1}
              </div>
              <p className="text-color-gray leading-relaxed">
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
            className="inline-block bg-color-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default OutputStandards;