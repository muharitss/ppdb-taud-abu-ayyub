import React from 'react';
import { content } from '../data/content';
import { Button } from './ui/button';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Name */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <img 
                src={content.header.logo} 
                alt="Logo TAUD SaQu Abu Ayyub" 
                className="h-10 w-10 object-contain"
              />
              <h3 className="text-xl font-bold">
                {content.footer.institutionName}
              </h3>
            </div>
            <p className="text-blue-100 text-sm">
              {content.footer.tagline}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              variant="secondary" 
              className="bg-orange-500 hover:bg-orange-600"
            >
               <a href="https://bit.ly/PPDB-TAUDSaqu-A4">Daftar Sekarang</a>
            </Button>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-blue-100 text-sm">
              {content.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};