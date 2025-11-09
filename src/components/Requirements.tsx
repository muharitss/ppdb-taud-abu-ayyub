import React from 'react';
import { content } from '../data/content';
import { Card, CardContent } from './ui/card';

export const Requirements: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
          Syarat Pendaftaran
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Administrative Requirements */}
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-blue-600 mb-4 text-center">
                {content.requirements.administrative.title}
              </h3>
              <ul className="space-y-3">
                {content.requirements.administrative.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Non-Administrative Requirements */}
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-orange-600 mb-4 text-center">
                {content.requirements.nonAdministrative.title}
              </h3>
              <ul className="space-y-3">
                {content.requirements.nonAdministrative.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};