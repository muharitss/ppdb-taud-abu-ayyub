import React, { useState, useRef } from 'react';

const Documentation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const mediaItems = [
    // 10 Foto
    { id: 1, type: 'foto', title: '', image: '/kegiatan-1.jpg' },
    { id: 2, type: 'foto', title: ' ', image: '/kegiatan-2.jpg' },
    { id: 3, type: 'foto', title: ' ', image: '/kegiatan-3.jpg' },
    { id: 4, type: 'foto', title: ' ', image: '/kegiatan-4.jpg' },
    { id: 5, type: 'foto', title: ' ', image: '/kegiatan-5.jpg' },
    { id: 6, type: 'foto', title: ' ', image: '/kegiatan-6.jpg' },
    { id: 7, type: 'foto', title: ' ', image: '/kegiatan-7.jpg' },
    { id: 8, type: 'foto', title: ' ', image: '/kegiatan-8.jpg' },
    { id: 9, type: 'foto', title: ' ', image: '/kegiatan-9.jpg' },
    { id: 10, type: 'foto', title: ' ', image: '/kegiatan-10.jpg' },
    { id: 10, type: 'foto', title: 'Ruangan Belajar', image: '/kelas.jpg' },
    { id: 10, type: 'foto', title: 'kitab belajar membaca', image: '/kegiatan-11.jpg' },
    { id: 10, type: 'foto', title: 'Kitab Aisar ', image: '/kegiatan-12.jpg' },
    { id: 10, type: 'foto', title: 'Kitab ilmu Quran', image: '/kegiatan-13.jpg' },

  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
      setCurrentIndex(prev => Math.min(mediaItems.length - 1, prev + 1));
    }
  };

  const goToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 256; // w-64 = 256px
      const gap = 16; // gap-4 = 16px
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleMediaClick = (item: any) => {
    if (item.type === 'video') {
      // Untuk video, buka di new tab
      window.open(item.video, '_blank');
    }
    // Untuk foto, tidak perlu action khusus
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Dokumentasi Foto & Video
        </h2>
        
        <div className="relative">
          {/* Navigation Buttons */}
          <button 
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
          >
            ←
          </button>
          
          <button 
            onClick={scrollRight}
            disabled={currentIndex === mediaItems.length - 1}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
          >
            →
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {mediaItems.map((item, index) => (
              <div 
                key={item.id}
                className="flex-none w-64 md:w-80 bg-white rounded-xl shadow-lg border border-[var(--color-light)] snap-start cursor-pointer hover-lift transition-all duration-300"
                onClick={() => {
                  goToSlide(index);
                  handleMediaClick(item);
                }}
              >
                <div className="h-48 bg-gray-200 rounded-t-xl flex items-center justify-center overflow-hidden relative">
                  {/* Gambar Thumbnail */}
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hanya Play Button untuk Video (tanpa badge type) */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-[var(--color-accent)] rounded-full p-3 hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-[var(--color-dark)] font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-dark)] text-sm opacity-75 mt-1">
                    {item.type === 'foto' ? 'Dokumentasi Kegiatan' : 'Video Dokumentasi'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dot Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {mediaItems.slice(0, 8).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-[var(--color-accent)]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
            {mediaItems.length > 8 && (
              <span className="text-gray-500 text-sm">+{mediaItems.length - 8}</span>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center mt-6 space-x-4 md:hidden">
            <button 
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⵦ
            </button>
            <button 
              onClick={scrollRight}
              disabled={currentIndex === mediaItems.length - 1}
              className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ᐳ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Documentation;