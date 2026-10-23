import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/features/landing/pages/LandingPage';
import RegistrationStartPage from '@/features/registration/pages/RegistrationStartPage';
import PaymentPage from '@/features/payments/pages/PaymentPage';
import FullFormPage from '@/features/registration/pages/FullFormPage';
import StatusPage from '@/features/status/pages/StatusPage';
import AdminLoginPage from '@/features/admin/pages/AdminLoginPage';
import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import AdminPaymentListPage from '@/features/admin/pages/AdminPaymentListPage';
import AdminRegistrantDetailPage from '@/features/admin/pages/AdminRegistrantDetailPage';
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
      <Route path="/status" element={<StatusPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="pembayaran" element={<AdminPaymentListPage />} />
        <Route path="pendaftar/:id" element={<AdminRegistrantDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
