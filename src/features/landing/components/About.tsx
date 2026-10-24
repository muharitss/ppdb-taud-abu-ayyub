import React from 'react';

const About: React.FC = () => {

  return (
    <section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] py-16 md:py-24 overflow-hidden">
      {/* Ornament Background sama seperti Hero */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 bg-[url('/ornamen.png')]"
      />
      
      {/* Additional gradient overlay untuk readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-secondary)]/80" />

      {/* Content */}
      <div className="container relative mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Tentang TAUD SaQu
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 relative z-10">
            <p className="text-white/90 leading-relaxed text-lg">
              TAUD SaQu adalah salah satu layanan pendidikan di Islamic Centre Wadi Mubarak 
              untuk jenjang Pendidikan Anak Usia dini (sejak usia 3,6 tahun). 
              Program unggulan: Tahfidzul Qur'an dan Pembiasaan Akhlak Qur'ani. 
              Harapannya, Al-Qur'an menjadi nilai utama dalam tumbuh kembang anak usia dini.
            </p>
            
              <div className="mt-4 text-white/90 leading-relaxed text-lg space-y-4">
                <p>
                  Dengan kurikulum yang terintegrasi antara pendidikan umum dan agama, 
                  TAUD SaQu berkomitmen membentuk generasi Qur'ani yang berakhlak mulia.
                </p>
                <p>
                  Fasilitas yang lengkap dan lingkungan yang nyaman mendukung proses 
                  belajar mengajar yang optimal bagi anak-anak.
                </p>
              </div>
          
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
