import React from 'react';

const ContactInfo: React.FC = () => {
  return (
    <section className="bg-color-gray py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-color-orange text-center mb-12">
          Informasi Pendaftaran & Kontak
        </h2>
        
        <div className="max-w-2xl mx-auto bg-color-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-color-gray mb-4">
                📌 Formulir Pendaftaran Online
              </h3>
              <a 
                href="https://bit.ly/PPDB-TAUDSaqu-A4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-color-orange hover:bg-orange-600 text-white py-3 px-8 rounded-full font-semibold text-lg transition-colors duration-300 mb-4"
              >
                ➡️ Isi Formulir Online di Sini
              </a>
              <p className="text-color-gray text-sm">
                Klik tombol di atas untuk mengisi formulir pendaftaran online
              </p>
            </div>

            <div className="border-t border-color-gray pt-6">
              <h3 className="text-xl font-bold text-color-gray mb-4 text-center">
                WA Admin (Klik langsung chat):
              </h3>
              
              <div className="space-y-3">
                <a 
                  href="https://wa.me/6282169599979"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-color-blue hover:bg-blue-600 text-white py-3 px-6 rounded-full font-semibold transition-colors duration-300"
                >
                  Ummu Rumi: 0821-6959-9979
                </a>
                
                <a 
                  href="https://wa.me/6281367074138"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-color-blue hover:bg-blue-600 text-white py-3 px-6 rounded-full font-semibold transition-colors duration-300"
                >
                  Admin: 0813-6707-4138
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="https://wa.me/6282169599979"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-color-orange hover:bg-orange-600 text-white px-12 py-4 rounded-full font-semibold text-xl transition-colors duration-300 shadow-lg"
          >
            Hubungi via WhatsApp Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;