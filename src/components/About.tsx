import React, { useState } from 'react';

const About: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Tentang TAUD SaQu
        </h2>
        
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--color-light)] to-gray-50 rounded-2xl p-8 shadow-lg border border-[var(--color-light)]">
          <p className="text-[var(--color-dark)] leading-relaxed mb-6">
            TAUD SaQu adalah salah satu layanan pendidikan di Islamic Centre Wadi Mubarak 
            untuk jenjang Pendidikan Anak Usia dini (sejak usia 3,6 tahun). 
            Program unggulan: Tahfidzul Qur'an dan Pembiasaan Akhlak Qur'ani. 
            Harapannya, Al-Qur'an menjadi nilai utama dalam tumbuh kembang anak usia dini.
          </p>
          
          {expanded && (
            <div className="text-[var(--color-dark)] leading-relaxed space-y-4">
              <p>
                Dengan kurikulum yang terintegrasi antara pendidikan umum dan agama, 
                TAUD SaQu berkomitmen membentuk generasi Qur'ani yang berakhlak mulia.
              </p>
              <p>
                Fasilitas yang lengkap dan lingkungan yang nyaman mendukung proses 
                belajar mengajar yang optimal bagi anak-anak.
              </p>
            </div>
          )}
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mt-4 bg-[var(--color-accent)] hover:opacity-90 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md"
          >
            {expanded ? 'Tutup' : 'Lihat Selengkapnya'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;