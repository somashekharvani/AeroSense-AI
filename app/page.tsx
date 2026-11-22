'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Activity,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import {
  HeroCityScene,
  LivePreviewWidget,
  PillarCards,
  HowItWorksSection,
  DroneTeaserSection,
  LandingFooter,
} from '@/components/landing';
import { Button } from '@/components/ui/button';
import { SourceBadge } from '@/components/ui/source-badge';

export default function LandingHomePage() {
  const tCommon = useTranslations('common');
  const { location } = useLocation();
  const { data: snapshot } = useSnapshot();

  const aqiData = snapshot?.indianAqi;
  const atmosphere = snapshot?.atmosphere;
  const fused = snapshot?.fusedAir;

  const scrollToPillars = () => {
    const el = document.getElementById('pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in-50 duration-500">
      {/* Hero Section */}
      <section className="relative space-y-6 pt-2 sm:pt-4">
        {/* Hero Narrative Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/70 border border-emerald-700/60 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Deterministic Clean-Air Decision Engine</span>
            {fused && <SourceBadge source={fused.dominantSource} />}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.12]">
            Breathe Smarter.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Live Healthier.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            AeroSense AI empowers families, schools, and communities across India to navigate severe winter smog and urban air pollution with deterministic low-emission routines, indoor air physics, and verifiable Impact Receipts.
          </p>

          {/* Dual Primary Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:gap-3"
            >
              <span>Explore Live Air</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={scrollToPillars}
              className="border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm gap-2"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Discover AeroSense AI</span>
            </Button>
          </div>
        </div>

        {/* Photorealistic 3D City & Atmospheric Digital Twin */}
        <div className="relative pt-2">
          <HeroCityScene
            cityName={location.name}
            aqi={aqiData?.aqi ?? 84}
            category={aqiData?.category ?? 'Satisfactory'}
            pm25={fused?.pollutants?.pm25 ?? 50.4}
            dominantPollutant={aqiData?.dominantPollutantName ?? 'PM2.5'}
            boundaryLayerHeightM={atmosphere?.boundaryLayerHeightM ?? 380}
            lastUpdated={snapshot?.timestamp ? new Date(snapshot.timestamp).toLocaleTimeString() : undefined}
          />
        </div>
      </section>

      {/* Live Air Intelligence Preview Bar */}
      <LivePreviewWidget />

      {/* Five Pillars of Clean Air Intelligence */}
      <PillarCards />

      {/* Architecture & Integrity Flow */}
      <HowItWorksSection />

      {/* Drone Hardware Innovation Teaser */}
      <DroneTeaserSection />

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
