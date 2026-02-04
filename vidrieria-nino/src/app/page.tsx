import ContactSection from "../features/landing/components/ContactSection";
import Footer from "../features/landing/components/Footer";
import GallerySection from "../features/landing/components/GallerySection";
import HeroSection from "../features/landing/components/HeroSection";
import Navbar from "../features/landing/components/Navbar";
import ServicesSection from "../features/landing/components/ServicesSection";
import SimuladorSection from "../features/landing/components/SimuladorSection";
import FAQSection from "../features/landing/components/FAQSection";
import { IntelligentContactForm } from "../features/leads/components/IntelligentContactForm";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      {/* <SimuladorSection /> */}
      {/* <ContactSection /> */}
      <IntelligentContactForm />.
      <FAQSection />
      <Footer />
    </>
  );
}