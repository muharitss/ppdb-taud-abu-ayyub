import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Documentation from "../components/Documentation";
import GraduateStandards from "../components/OutputStandards";
import About from "../components/About";
import VisionMission from "../components/VissionMission";
import Programs from "../components/Programs";
import RegistrationRequirements from "../components/RegistrationRequirements";
import ContactInfo from "../components/ContactInfo";
import Location from "../components/Location";
import Footer from "../components/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      <Navbar />
      <Hero />
      <Documentation />
      <GraduateStandards />
      <About />
      <VisionMission />
      <Programs />
      <RegistrationRequirements />
      <ContactInfo />
      <Location />
      <Footer />
    </div>
  );
};

export default LandingPage;
