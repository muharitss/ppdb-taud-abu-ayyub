import React from 'react';

const RegistrationRequirements: React.FC = () => {
  const administrative = [
    "Membayar biaya pendaftaran Rp300.000",
    "Mengisi formulir online/offline",
    "Fotokopi Akte (1)",
    "Fotokopi KK (1)",
    "Pas Foto 3x4 merah (2)"
  ];

  const nonAdministrative = [
    "Usia minimal 3 tahun 6 bulan",
    "Mampu memahami instruksi",
    "Lulus toilet training",
    "Jelas melafalkan huruf",
    "Orang tua siap bekerja sama",
    "Siap berkomitmen selama masa pendidikan TAUD"
  ];

  return (
    <section className="bg-color-brown py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Syarat Pendaftaran
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-color-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-color-gray mb-6 text-center">
              Administrasi
            </h3>
            <ul className="space-y-3">
              {administrative.map((item, index) => (
                <li key={index} className="flex items-center text-color-gray">
                  <div className="w-6 h-6 bg-color-blue rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-color-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-color-gray mb-6 text-center">
              Non Administrasi
            </h3>
            <ul className="space-y-3">
              {nonAdministrative.map((item, index) => (
                <li key={index} className="flex items-center text-color-gray">
                  <div className="w-6 h-6 bg-color-blue rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-color-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-300"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegistrationRequirements;