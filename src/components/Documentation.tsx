import React from 'react';

const Documentation: React.FC = () => {
  const mediaItems = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    type: i < 10 ? 'foto' : 'video',
    title: i < 10 ? `Foto Kegiatan ${i + 1}` : `Video Kegiatan ${i - 9}`
  }));

  return (
    <section className="bg-color-gray py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Dokumentasi Foto & Video
        </h2>
        
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {mediaItems.map((item) => (
              <div 
                key={item.id}
                className="flex-none w-64 md:w-80 bg-color-white rounded-xl shadow-lg"
              >
                <div className="h-48 bg-gray-300 rounded-t-xl flex items-center justify-center">
                  <span className="text-color-gray">
                    {item.type === 'foto' ? '📷' : '🎥'} {item.title}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-color-gray font-semibold">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6 space-x-4">
            <button className="bg-color-blue text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
              ←
            </button>
            <button className="bg-color-blue text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Documentation;