import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-darker)] py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-12 w-12"
            />
            <span className="text-[var(--color-secondary)] font-bold text-xl">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          <p className="text-white/80 mb-4 max-w-md mx-auto leading-relaxed">
            Jl. Sakura Gg. Mufakat 3 RT 002/RW 013<br />
            Kel. Duri Barat, Kec. Mandau, Kab. Bengkalis
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-accent)] hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center shadow-md"
          >
            Daftar Sekarang
          </a>
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-primary)] hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center shadow-md"
          >
            📝 Formulir Online
          </a>
          <a 
            href="https://wa.me/6282169599979"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto text-center shadow-md"
          >
            WhatsApp Admin
          </a>
        </div>
        
        <div className="text-center border-t border-white/20 pt-6">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} TAUD SaQu Abu Ayyub. All rights reserved.
          </p>
          {/* Credit Developer */}
          <p className="text-white/40 text-xs mt-2">
            Developed by{' '}
            <a 
              href="https://github.com/muharits" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors duration-300"
            >
              Muhammad Harits
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;