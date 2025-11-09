import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-[var(--color-light)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-10 w-10"
            />
            <span className="text-[var(--color-primary)] font-bold text-lg">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          {/* <a 
            href="https://bit.ly/PPDB-TAUDSaqu-A4"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-accent)] hover:opacity-90 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md"
          >
            Daftar Sekarang
          </a> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;