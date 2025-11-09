import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProgramMaterials } from './components/ProgramMaterials';
import { Documentation } from './components/Documentation';
import { Requirements } from './components/Requirements';
import { Contact } from './components/Contact';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { OutputStandards } from './components/OutputStandards';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <OutputStandards />
        <ProgramMaterials />
        <Documentation />
        <Requirements />
        <Contact />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

export default App;