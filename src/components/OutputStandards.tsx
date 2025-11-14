import React, { useState, useRef } from 'react';

const GraduateStandards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320, // card width + gap
        behavior: 'smooth'
      });
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320, // card width + gap
        behavior: 'smooth'
      });
      setCurrentIndex(prev => Math.min(standards.length - 1, prev + 1));
    }
  };

  const goToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // w-80 = 320px
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  return (
    <section className="bg-gradient-to-br from-[var(--color-light)] to-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Standar Output Kelulusan
        </h2>
        
        <div className="relative">
          {/* Navigation Buttons - Desktop */}
          <button 
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed hover-lift hidden md:block"
          >
            ←
          </button>
          
          <button 
            onClick={scrollRight}
            disabled={currentIndex === standards.length - 1}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed hover-lift hidden md:block"
          >
            →
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          >
            {standards.map((standard, index) => (
              <div 
                key={index}
                className="flex-none w-80 bg-white rounded-2xl shadow-lg p-6 border border-[var(--color-light)] hover-lift snap-start cursor-pointer"
                onClick={() => goToSlide(index)}
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

          {/* Dot Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {standards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-[var(--color-accent)] w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex justify-center mt-6 space-x-4 md:hidden">
            <button 
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button 
              onClick={scrollRight}
              disabled={currentIndex === standards.length - 1}
              className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
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