import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[var(--color-gray)] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-10 w-10"
            />
            <span className="text-[var(--color-orange)] font-bold text-lg">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-blue)] hover:opacity-90 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;