import React from 'react';
import { content } from '../data/content';
import { Carousel } from './ui/carousel';
import { Card, CardContent } from './ui/card';

export const ProgramMaterials: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-12">
          Materi & Program
        </h2>
        
        <Carousel>
          {content.programMaterials.map((material, index) => (
            <Card key={index} className="h-48">
              <CardContent className="p-6 h-full flex items-center">
                <p className="text-lg text-gray-700 text-center">
                  {material}
                </p>
              </CardContent>
            </Card>
          ))}
        </Carousel>
      </div>
    </section>
  );
};