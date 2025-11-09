import React from 'react';

const Location: React.FC = () => {
  return (
    <section className="bg-color-brown py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Lokasi Sekolah
        </h2>
        
        <div className="max-w-4xl mx-auto bg-color-white rounded-2xl p-4 shadow-lg">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d260.8374199392628!2d101.17622639292253!3d1.2654648909816073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d37bb323733e7d%3A0x3b547048645a2748!2ssekolah%20Sunnah%20dikota%20duri%20TAAUD%20Abu%20Ayyub!5e0!3m2!1sid!2sid!4v1762671180974!5m2!1sid!2sid" 
            width="100%" 
            height="400" 
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi TAUD SaQu Abu Ayyub"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Location;