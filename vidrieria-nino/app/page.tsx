
import ContactSection from "../components/cliente/ContactSection";
import Footer from "../components/cliente/Footer";
import GallerySection from "../components/cliente/GallerySection";
import HeroSection from "../components/cliente/HeroSection";
import Navbar from "../components/cliente/Navbar";
import ProductsSection from "../components/cliente/ProductsSection";
import ServicesSection from "../components/cliente/ServicesSection";
import TestimonialsSection from "../components/cliente/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <ProductsSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
