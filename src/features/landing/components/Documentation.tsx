import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface MediaItem {
  id: number;
  type: 'foto' | 'video';
  title: string;
  image: string;
  video?: string;
}

const mediaItems: MediaItem[] = [
  { id: 1, type: 'foto', title: '', image: '/kegiatan-1.jpg' },
  { id: 2, type: 'foto', title: '', image: '/kegiatan-2.jpg' },
  { id: 3, type: 'foto', title: '', image: '/kegiatan-3.jpg' },
  { id: 4, type: 'foto', title: '', image: '/kegiatan-4.jpg' },
  { id: 5, type: 'foto', title: '', image: '/kegiatan-5.jpg' },
  { id: 6, type: 'foto', title: 'Aktivitas Kelas', image: '/kegiatan-6.jpg' },
  { id: 7, type: 'foto', title: 'Aktivitas Kelas', image: '/kegiatan-7.jpg' },
  { id: 8, type: 'foto', title: 'Aktivitas Kelas', image: '/kegiatan-8.jpg' },
  { id: 9, type: 'foto', title: 'Aktivitas Kelas', image: '/kegiatan-9.jpg' },
  { id: 10, type: 'foto', title: 'Aktivitas Kelas', image: '/kegiatan-10.jpg' },
  { id: 11, type: 'foto', title: 'Ruangan Belajar Nyaman', image: '/kelas.jpg' },
  { id: 12, type: 'foto', title: 'Kitab Belajar Membaca', image: '/kegiatan-11.jpg' },
  { id: 13, type: 'foto', title: 'Kitab Metode Aisar', image: '/kegiatan-12.jpg' },
  { id: 14, type: 'foto', title: 'Kitab Ilmu Al-Qur\'an', image: '/kegiatan-13.jpg' },
];

const Documentation: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  const handleMediaClick = (item: MediaItem) => {
    if (item.type === 'video' && item.video) {
      window.open(item.video, '_blank');
    }
  };

  return (
    <section id="dokumentasi" className="bg-white py-14 sm:py-18 md:py-20 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Dokumentasi Kegiatan & Fasilitas
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Potret aktivitas pembelajaran, sarana belajar, dan kebersamaan santri di TAUD SaQu Abu Ayyub.
          </p>
        </div>

        <div className="relative px-2 sm:px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent>
              {mediaItems.map((item, index) => (
                <CarouselItem
                  key={item.id || index}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-1 h-full">
                    <Card
                      className="group/card relative aspect-square sm:aspect-auto sm:h-64 w-full overflow-hidden rounded-2xl border border-gray-100 p-0 gap-0 shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => handleMediaClick(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.title.trim() || `Dokumentasi ${index + 1}`}
                        className="absolute inset-0 size-full scale-100 object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-105"
                      />

                      {/* Video Indicator */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                          <div className="rounded-full bg-[var(--color-primary)] p-3 transition-transform duration-300 group-hover/card:scale-110">
                            <span className="text-xl text-white">▶</span>
                          </div>
                        </div>
                      )}

                      {/* Background fade effects */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 top-auto flex flex-col justify-end bg-black/20 p-3 sm:p-4">
                        <h3 className="text-xs sm:text-base font-bold text-white truncate">
                          {item.title.trim()}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-white/80">
                          {item.type === 'foto' ? 'Dokumentasi Kegiatan' : 'Video Dokumentasi'}
                        </p>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:inline-flex -left-6 lg:-left-12" />
            <CarouselNext className="hidden sm:inline-flex -right-6 lg:-right-12" />

            {/* Dots Navigation */}
            <div className="flex flex-wrap justify-center gap-2 py-3 mt-4">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 cursor-pointer rounded-full transition-all duration-300 ease-in-out',
                    index === current
                      ? 'bg-[var(--color-primary)] w-5 opacity-100'
                      : 'bg-gray-300 w-2 opacity-50 hover:opacity-80'
                  )}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Ke slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Documentation;
