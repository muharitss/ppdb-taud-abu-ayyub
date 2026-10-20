import React, { useEffect, useState } from 'react';
import { cn } from 'cn';
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
  { id: 2, type: 'foto', title: ' ', image: '/kegiatan-2.jpg' },
  { id: 3, type: 'foto', title: ' ', image: '/kegiatan-3.jpg' },
  { id: 4, type: 'foto', title: ' ', image: '/kegiatan-4.jpg' },
  { id: 5, type: 'foto', title: ' ', image: '/kegiatan-5.jpg' },
  { id: 6, type: 'foto', title: ' ', image: '/kegiatan-6.jpg' },
  { id: 7, type: 'foto', title: ' ', image: '/kegiatan-7.jpg' },
  { id: 8, type: 'foto', title: ' ', image: '/kegiatan-8.jpg' },
  { id: 9, type: 'foto', title: ' ', image: '/kegiatan-9.jpg' },
  { id: 10, type: 'foto', title: ' ', image: '/kegiatan-10.jpg' },
  { id: 11, type: 'foto', title: 'Ruangan Belajar', image: '/kelas.jpg' },
  { id: 12, type: 'foto', title: 'Kitab Belajar Membaca', image: '/kegiatan-11.jpg' },
  { id: 13, type: 'foto', title: 'Kitab Aisar', image: '/kegiatan-12.jpg' },
  { id: 14, type: 'foto', title: 'Kitab Ilmu Quran', image: '/kegiatan-13.jpg' },
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
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Dokumentasi Foto & Video
        </h2> */}

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
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-1 h-full">
                    <Card
                      className="group/card relative aspect-square sm:aspect-auto sm:h-60 w-full overflow-hidden rounded-xl border border-[var(--color-light)] p-0 gap-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift bg-gray-100"
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
                          <div className="rounded-full bg-[var(--color-accent)] p-3 transition-transform duration-300 group-hover/card:scale-110">
                            <span className="text-xl text-white">▶</span>
                          </div>
                        </div>
                      )}

                      {/* Background fade effects */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 top-auto flex flex-col justify-end bg-black/20 p-4">
                        <h3 className="text-lg font-bold text-white truncate">
                          {item.title.trim() || 'Dokumentasi Kegiatan'}
                        </h3>
                        <p className="text-sm text-white/90">
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
            <div className="flex flex-wrap justify-center gap-2 py-3 mt-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 cursor-pointer rounded-full transition-all duration-500 ease-in-out',
                    index === current
                      ? 'bg-[var(--color-primary)] w-4 opacity-100'
                      : 'bg-gray-300 w-2 opacity-40 hover:opacity-70'
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