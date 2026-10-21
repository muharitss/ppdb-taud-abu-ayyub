import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/features/landing/pages/LandingPage';
import RegistrationStartPage from '@/features/registration/pages/RegistrationStartPage';
import PaymentPage from '@/features/payments/pages/PaymentPage';
import StatusPage from '@/features/status/pages/StatusPage';
import AdminLoginPage from '@/features/admin/pages/AdminLoginPage';
import AdminLayout from '@/features/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import NotFoundPage from './NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/daftar" element={<RegistrationStartPage />} />
      <Route path="/bayar/:registrationNumber" element={<PaymentPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
