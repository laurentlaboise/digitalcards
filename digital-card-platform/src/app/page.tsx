import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import ShareableCarousel from '@/components/landing/ShareableCarousel';
import IntegrationsEcosystem from '@/components/landing/IntegrationsEcosystem';
import DeveloperAPI from '@/components/landing/DeveloperAPI';
import ROICalculator from '@/components/landing/ROICalculator';
import SecurityBlock from '@/components/landing/SecurityBlock';
import FAQAccordion from '@/components/landing/FAQAccordion';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-stone-900">
      <Header />
      <main>
        <HeroSection />
        <FeatureShowcase />
        <ShareableCarousel />
        <IntegrationsEcosystem />
        <DeveloperAPI />
        <ROICalculator />
        <SecurityBlock />
        <FAQAccordion />
      </main>
      <Footer />
    </div>
  );
}
