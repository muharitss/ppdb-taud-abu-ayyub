import React from 'react';

const ContactInfo: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] text-center mb-12">
          Informasi Pendaftaran & Kontak
        </h2>
        
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[var(--color-light)] to-gray-50 rounded-2xl p-8 shadow-lg border border-[var(--color-light)] mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">
                📌 Formulir Pendaftaran Online
              </h3>
              <a 
                href="https://bit.ly/PPDB-TAUDSaqu-A4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[var(--color-primary)] hover:opacity-90 text-white py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 mb-4 shadow-md hover-lift"
              >
                ➡️ Isi Formulir Online di Sini
              </a>
              <p className="text-[var(--color-dark)] text-sm">
                Klik tombol di atas untuk mengisi formulir pendaftaran online
              </p>
            </div>

            <div className="border-t border-[var(--color-light)] pt-6">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4 text-center">
                WA Admin (Klik langsung chat):
              </h3>
              
              <div className="space-y-3">
                <a 
                  href="https://wa.me/6282169599979"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[var(--color-accent)] hover:opacity-90 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 shadow-md text-center"
                >
                  Ummu Rumi: 0821-6959-9979
                </a>
                
                <a 
                  href="https://wa.me/6281367074138"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[var(--color-accent)] hover:opacity-90 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 shadow-md text-center"
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
            className="inline-block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white px-12 py-4 rounded-full font-semibold text-xl transition-all duration-300 shadow-lg hover-lift"
          >
            Hubungi via WhatsApp Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;