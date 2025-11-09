import React from 'react';
import { content } from '../data/content';

export const Location: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
          Lokasi
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <iframe
              src={content.location.embedUrl}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi TAUD SaQu Abu Ayyub"
            />
          </div>
        </div>
      </div>
    </section>
  );
};