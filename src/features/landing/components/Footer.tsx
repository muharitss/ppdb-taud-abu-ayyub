import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-[var(--color-dark)] to-[var(--color-darker)] py-12 sm:py-16 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
            <span className="text-[var(--color-secondary)] font-bold text-lg sm:text-xl tracking-tight">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Jl. Sakura Gg. Mufakat 3 RT 002/RW 013<br />
            Kel. Duri Barat, Kec. Mandau, Kab. Bengkalis, Riau
          </p>
        </div>
        
        <div className="text-center border-t border-white/10 pt-6 max-w-4xl mx-auto">
          <p className="text-white/60 text-xs sm:text-sm">
            © {new Date().getFullYear()} TAUD SaQu Abu Ayyub. All rights reserved.
          </p>
          <p className="text-white/40 text-[11px] sm:text-xs mt-2">
            Developed by{' '}
            <a 
              href="https://github.com/muharits" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/70 underline underline-offset-2 transition-colors duration-200"
            >
              Muharitss
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
