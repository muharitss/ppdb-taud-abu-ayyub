import React from 'react';
import { content } from '../data/content';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <pre className="text-lg md:text-xl text-gray-700 whitespace-pre-wrap font-sans">
                {content.hero.openingText}
              </pre>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" >
                <a href="https://bit.ly/PPDB-TAUDSaqu-A4">Daftar Sekarang</a>
              </Button>
              <Button variant="secondary">
                <a href="https://wa.me/6282169599979">Whatsapp Ummu Rumi</a>
              </Button>
            </div>
          </div>

          {/* Image Card */}
          <div className="flex justify-center">
            <Card className="max-w-md w-full overflow-hidden">
              <img 
                src={content.hero.image} 
                alt="Anak-anak TAUD SaQu Abu Ayyub"
                className="w-full h-64 md:h-80 object-cover"
              />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};