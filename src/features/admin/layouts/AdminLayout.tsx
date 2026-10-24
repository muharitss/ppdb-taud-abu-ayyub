import React from 'react';
import { Outlet, Navigate, useLocation, Link, NavLink } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  ShieldAlert,
  Loader2,
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminLayout: React.FC = () => {
  const { user, profile, isAdmin, isLoading, error, signOut } = useAdminAuth();
  const location = useLocation();

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

  const navItems = [
    { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
    { to: '/admin/pembayaran', label: 'Verifikasi Pembayaran', icon: CreditCard },
    { to: '/admin/pendaftar', label: 'Daftar Pendaftar', icon: Users },
    { to: '/admin/pengaturan', label: 'Pengaturan PPDB', icon: Settings },
    { to: '/admin/audit', label: 'Log Audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="font-bold text-lg text-[var(--color-primary)] tracking-tight hover:opacity-80 transition-opacity">
                PPDB TAUD Abu Ayyub
              </Link>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Admin Portal
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-slate-800">
                  {profile?.full_name || 'Administrator'}
                </span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-1.5 text-slate-700 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-slate-100 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ user, profile }} />
      </main>
    </div>
  );
};

export default AdminLayout;
