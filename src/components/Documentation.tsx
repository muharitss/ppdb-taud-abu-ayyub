import React from 'react';
import { content } from '../data/content';
import { Carousel } from './ui/carousel';
import { Card } from './ui/card';

export const Documentation: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-yellow-600 mb-12">
          Dokumentasi
        </h2>
        
        <Carousel>
          {/* Photos */}
          {content.documentation.photos.map((photo, index) => (
            <Card key={`photo-${index}`} className="overflow-hidden">
              <img 
                src={photo} 
                alt={`Dokumentasi kegiatan TAUD SaQu Abu Ayyub ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </Card>
          ))}
          
          {/* Videos - using thumbnail approach */}
          {content.documentation.videos.map((_, index) => (
            <Card key={`video-${index}`} className="overflow-hidden">
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">Video {index + 1}</p>
                </div>
              </div>
            </Card>
          ))}
        </Carousel>
      </div>
    </section>
  );
};