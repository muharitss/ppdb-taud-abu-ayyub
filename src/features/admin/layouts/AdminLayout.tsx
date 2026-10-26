import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  ShieldAlert,
  Loader2,
  // Settings,
  Users,
  GraduationCap,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, profile, isAdmin, isLoading, error, signOut } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs font-medium tracking-wide">Memverifikasi hak akses admin...</p>
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
        <div className="bg-white p-8 rounded-2xl shadow-xs border border-red-100 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Akses Dibatasi</h1>
            <p className="text-sm text-slate-600 mt-1">
              {error || 'Akun Anda tidak memiliki hak akses administrator sistem PPDB.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full text-xs font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar dari Akun Ini
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrantsActive =
    location.pathname === '/admin' || location.pathname.startsWith('/admin/pendaftar');
  // const isSettingsActive = location.pathname.startsWith('/admin/pengaturan');

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Brand + Navigation */}
            <div className="flex items-center gap-6">
              <Link
                to="/admin"
                className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-slate-900">
                    TAUD Abu Ayyub
                  </span>
                  <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Admin
                  </span>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  to="/admin"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isRegistrantsActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Pendaftar
                </Link>

                {/* <Link
                  to="/admin/pengaturan"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isSettingsActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Pengaturan
                </Link> */}
              </nav>
            </div>

            {/* Right: User Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-800 leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight truncate max-w-[160px]">
                  {user.email}
                </span>
              </div>

              {/* Mobile quick link to settings if not active */}
              {/* <Link
                to="/admin/pengaturan"
                className={`sm:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${
                  isSettingsActive ? 'bg-slate-100 text-slate-900' : ''
                }`}
                title="Pengaturan"
              >
                <Settings className="w-4 h-4" />
              </Link> */}

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-8 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                title="Keluar dari sesi admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  );
};

export default AdminLayout;
