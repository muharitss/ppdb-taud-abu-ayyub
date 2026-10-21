import React from 'react';
import { BrowserRouter } from 'react-router-dom';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default Providers;
