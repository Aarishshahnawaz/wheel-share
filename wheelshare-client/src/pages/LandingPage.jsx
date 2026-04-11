import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhatYouCanDo from '../components/WhatYouCanDo';
import HowItWorks from '../components/HowItWorks';
import CityStrip from '../components/CityStrip';
import TrustSection from '../components/TrustSection';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WhatYouCanDo />
      <HowItWorks />
      <CityStrip />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
