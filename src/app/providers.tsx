import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  );
};

export default Providers;
