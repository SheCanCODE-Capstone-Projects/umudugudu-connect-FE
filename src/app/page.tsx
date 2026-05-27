'use client';

import { useState } from 'react';
import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CTASection } from '@/components/home/CTASection';
import { Footer } from '@/components/home/Footer';

type Lang = 'EN' | 'RW' | 'FR';

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('EN');

  return (
    <main>
      <Navbar lang={lang} onLangChange={setLang} />
      <div id="home"><HeroSection lang={lang} /></div>
      <StatsBar lang={lang} />
      <div id="services"><ServicesGrid lang={lang} /></div>
      <div id="about"><HowItWorks lang={lang} /></div>
      <CTASection lang={lang} />
      <div id="contact"><Footer lang={lang} /></div>
    </main>
  );
}