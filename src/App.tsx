import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Documentation from './components/Documentation';
import About from './components/About';
import Programs from './components/Programs';
import RegistrationRequirements from './components/RegistrationRequirements';
import ContactInfo from './components/ContactInfo';
import Location from './components/Location';
import Footer from './components/Footer';
import VisionMission from './components/VissionMission';
import OutputStandards from './components/OutputStandards';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Documentation />
      <OutputStandards />
      <About />
      <VisionMission />
      <Programs />
      <RegistrationRequirements />
      <ContactInfo />
      <Location />
      <Footer />
    </div>
  );
}

export default App;