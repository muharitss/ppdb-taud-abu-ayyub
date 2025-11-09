import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-gray)] py-12 border-t border-[var(--color-blue)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-12 w-12"
            />
            <span className="text-[var(--color-orange)] font-bold text-xl">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          <p className="text-white mb-4 max-w-md mx-auto leading-relaxed">
            Jl. Sakura Gg. Mufakat 3 RT 002/RW 013<br />
            Kel. Duri Barat, Kec. Mandau, Kab. Bengkalis
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-blue)] hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center"
          >
            Daftar Sekarang
          </a>
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-orange)] hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center"
          >
            📝 Formulir Online
          </a>
          <a 
            href="https://wa.me/6282169599979"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center"
          >
            WhatsApp Admin
          </a>
        </div>
        
        <div className="text-center border-t border-white/20 pt-6">
          <p className="text-white/75">
            © {new Date().getFullYear()} TAUD SaQu Abu Ayyub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;