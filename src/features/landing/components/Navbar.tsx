import React from 'react';
import { Link } from 'react-router-dom';
import { getSessionCredentials } from '@/lib/sessionCredentials';

const Navbar: React.FC = () => {
  const sessionCreds = getSessionCredentials();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-[var(--color-light)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="TAUD SaQu Abu Ayyub" 
              className="h-10 w-10"
            />
            <span className="text-[var(--color-primary)] font-bold text-base sm:text-lg">
              TAUD SaQu Abu Ayyub
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to="/status"
              className="text-[var(--color-primary)] hover:bg-[var(--color-light)] px-3 sm:px-4 py-2 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm border border-[var(--color-primary)]/20"
            >
              Cek Status
            </Link>
            <Link 
              to={
                sessionCreds
                  ? `/daftar/formulir/${encodeURIComponent(sessionCreds.registrationNumber)}`
                  : "/daftar"
              }
              className="bg-[var(--color-accent)] hover:opacity-90 text-white px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md text-xs sm:text-base"
            >
              {sessionCreds ? "Lanjutkan Pendaftaran" : "Daftar Sekarang"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;