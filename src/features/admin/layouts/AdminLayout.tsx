import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  ShieldAlert,
  Loader2,
  Settings,
  MoreVertical,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, profile, isAdmin, isLoading, error, signOut } = useAdminAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-medium">Memverifikasi sesi administrator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Akses Ditolak (403)</h1>
            <p className="text-sm text-slate-600 mt-1">
              {error || 'Akun Anda tidak terdaftar sebagai administrator sistem PPDB.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun Ini
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Link
              to="/admin"
              className="font-bold text-base sm:text-lg text-[var(--color-primary)] tracking-tight hover:opacity-80 transition-opacity"
            >
              Admin PPDB TAUD Abu Ayyub
            </Link>

            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="h-9 w-9 p-0 rounded-full"
                aria-label="Menu"
              >
                <MoreVertical className="w-5 h-5 text-slate-700" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                  <Link
                    to="/admin/pengaturan"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Pengaturan
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  );
};

export default AdminLayout;
