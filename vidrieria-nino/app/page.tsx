import ContactSection from "../components/cliente/ContactSection";
import Footer from "../components/cliente/Footer";
import GallerySection from "../components/cliente/GallerySection";
import HeroSection from "../components/cliente/HeroSection";
import Navbar from "../components/cliente/Navbar";
import ServicesSection from "../components/cliente/ServicesSection";
import SimuladorSection from "../components/cliente/SimuladorSection";
import FAQSection from "../components/cliente/FAQSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      {/* <SimuladorSection /> */}
      <ContactSection />
      <FAQSection />
      <Footer />
    </>
  );
}