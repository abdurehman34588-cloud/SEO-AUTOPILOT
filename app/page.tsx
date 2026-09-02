import React from 'react';
import { Hero } from '@/components/landing/hero';
import { TrustSection } from '@/components/landing/trust-section';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CtaBanner } from '@/components/landing/cta-banner';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Hero />
      <TrustSection />
      <Features />
      <HowItWorks />
      <CtaBanner />
    </div>
  );
}
