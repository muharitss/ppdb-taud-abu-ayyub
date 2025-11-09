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
import GraduateStandards from './components/OutputStandards';

function App() {
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
}

export default App;