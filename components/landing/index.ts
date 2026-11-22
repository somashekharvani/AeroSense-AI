import dynamic from 'next/dynamic';

export { LivePreviewWidget } from './live-preview-widget';
export { PillarCards } from './pillar-cards';
export { HowItWorksSection } from './how-it-works-section';
export { DroneTeaserSection } from './drone-teaser-section';
export { LandingFooter } from './landing-footer';

// Client-only dynamic export for Three.js 3D City scene to avoid SSR hydration mismatches
export const HeroCityScene = dynamic(
  () => import('./hero-city-scene').then((mod) => mod.HeroCityScene),
  { ssr: false }
);
