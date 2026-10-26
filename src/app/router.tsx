import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/features/landing/pages/LandingPage';
import RegistrationStartPage from '@/features/registration/pages/RegistrationStartPage';
import PaymentPage from '@/features/payments/pages/PaymentPage';
import FullFormPage from '@/features/registration/pages/FullFormPage';
import SuccessPage from '@/features/registration/pages/SuccessPage';
import StatusPage from '@/features/status/pages/StatusPage';
import AdminLoginPage from '@/features/admin/pages/AdminLoginPage';
import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminRegistrantDetailPage from '@/features/admin/pages/AdminRegistrantDetailPage';
// import AdminConfigPage from '@/features/admin/pages/AdminConfigPage';
import NotFoundPage from './NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/daftar" element={<RegistrationStartPage />} />
      <Route path="/daftar/pembayaran" element={<PaymentPage />} />
      <Route path="/bayar/:registrationNumber" element={<PaymentPage />} />
      <Route path="/daftar/formulir" element={<FullFormPage />} />
      <Route path="/daftar/formulir/:registrationNumber" element={<FullFormPage />} />
      <Route path="/daftar/berhasil" element={<SuccessPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="pendaftar" element={<Navigate to="/admin" replace />} />
        <Route path="pendaftar/:id" element={<AdminRegistrantDetailPage />} />
        {/* <Route path="pengaturan" element={<AdminConfigPage />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
