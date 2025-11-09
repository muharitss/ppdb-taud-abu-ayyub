import React from 'react';
import { content } from '../data/content';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={content.header.logo} 
              alt="Logo TAUD SaQu Abu Ayyub" 
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-lg md:text-xl font-bold text-blue-600">
              {content.header.title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};