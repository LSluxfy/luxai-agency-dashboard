
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import Benefits from "./Benefits";
import CreativeStudioSection from "./CreativeStudioSection";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import Faq from "./Faq";
import Footer from "../navigation/Footer";

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartTrial = () => {
    navigate("/onboarding");
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Account for header height
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header scrollPosition={scrollPosition} onNavClick={scrollToSection} />
      
      <main className="flex-1">
        <HeroSection onStartTrial={handleStartTrial} onWatchDemo={() => scrollToSection("how-it-works")} />
        <HowItWorks />
        <Benefits />
        <CreativeStudioSection />
        <Pricing onSelect={handleStartTrial} />
        <Testimonials />
        <Faq />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
