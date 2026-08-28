import { setRequestLocale } from "next-intl/server";
import {
  BuildingSection,
  ContactSection,
  FaqSection,
  FooterSection,
  HeroSection,
  InteriorSection,
  IntroSection,
  LocationSection,
  NumbersSection,
  OfferSection,
  PlanSection,
  TermsSection,
  TourSection,
  ViewSection,
} from "@/components/sections";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Порядок из CLAUDE.md. Менять только там.
  return (
    <main>
      <IntroSection />
      <HeroSection />
      <NumbersSection />
      <OfferSection />
      <TermsSection />
      <PlanSection />
      <InteriorSection />
      <ViewSection />
      <TourSection />
      <BuildingSection />
      <LocationSection />
      <FaqSection />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
