import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getSessionCredentials } from '@/lib/sessionCredentials';

const NAV_LINKS = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Dokumentasi', href: '#dokumentasi' },
  { label: 'Standar Kelulusan', href: '#standar-kelulusan' },
  { label: 'Program', href: '#program' },
  { label: 'Biaya & Syarat', href: '#syarat' },
  { label: 'Lokasi', href: '#lokasi' },
];

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionCreds = getSessionCredentials();

  const ctaLink = sessionCreds
    ? `/daftar/formulir/${encodeURIComponent(sessionCreds.registrationNumber)}`
    : '/daftar';

  const ctaText = sessionCreds ? 'Lanjutkan Pendaftaran' : 'Daftar Sekarang';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-3 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
          >
            <img
              src="/logo.png"
              alt="TAUD SaQu Abu Ayyub"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
            />
            <span className="text-[var(--color-primary)] font-bold text-base sm:text-lg tracking-tight">
              TAUD SaQu Abu Ayyub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-700">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/status"
              className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-4 py-2 rounded-full font-semibold transition-colors duration-200 text-sm border border-[var(--color-primary)]/30"
            >
              Cek Status
            </Link>
            <Link
              to={ctaLink}
              className="bg-[var(--color-primary)] hover:bg-[#d96716] text-white px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm hover:shadow text-sm"
            >
              {ctaText}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-slate-700 hover:text-[var(--color-primary)] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700 pb-2 border-b border-gray-100">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <Link
              to="/status"
              onClick={closeMenu}
              className="w-full text-center text-[var(--color-primary)] border border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/10 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Cek Status Pendaftaran
            </Link>
            <Link
              to={ctaLink}
              onClick={closeMenu}
              className="w-full text-center bg-[var(--color-primary)] hover:bg-[#d96716] text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition-colors"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
