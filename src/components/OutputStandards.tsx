import React from 'react';
import { content } from '../data/content';
import { Carousel } from './ui/carousel';
import { Card, CardContent } from './ui/card';

export const OutputStandards: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
          Standar Output Kelulusan
        </h2>
        
        <Carousel>
          {content.outputStandards.map((standard, index) => (
            <Card key={index} className="h-48">
              <CardContent className="p-6 h-full flex items-center">
                <p className="text-lg text-gray-700 text-center">
                  {standard}
                </p>
              </CardContent>
            </Card>
          ))}
        </Carousel>
      </div>
    </section>
  );
};