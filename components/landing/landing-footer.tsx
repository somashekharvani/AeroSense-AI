'use client';

import * as React from 'react';
import Link from 'next/link';
import { Wind, Shield, Database, ExternalLink, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04070b] text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wind className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-base font-extrabold text-white font-display">AeroSense AI</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Know the air. Predict the risk. Protect your family. Prove the impact.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
              Clean-Air Decision Engine engineered for PromptWars Challenge 6. All science is executed by pure deterministic mathematical engines; Gemini plans and explains; every quantified recommendation displays an auditable Impact Receipt.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-display">
              Core Intelligence
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/overview" className="hover:text-emerald-400 transition-colors">
                  Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-emerald-400 transition-colors">
                  Pillar 1: Live Indian AQI
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="hover:text-teal-400 transition-colors">
                  Pillar 2: 48h Outlook & Inversion
                </Link>
              </li>
              <li>
                <Link href="/family" className="hover:text-sky-400 transition-colors">
                  Pillar 3: Family Exposure Budgets
                </Link>
              </li>
              <li>
                <Link href="/indoor" className="hover:text-indigo-400 transition-colors">
                  Pillar 4: Indoor Mass-Balance
                </Link>
              </li>
              <li>
                <Link href="/what-if" className="hover:text-amber-400 transition-colors">
                  Pillar 5: What-If Simulator
                </Link>
              </li>
              <li>
                <Link href="/drone" className="hover:text-cyan-400 transition-colors">
                  AeroSense Drone Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources & Provenance */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-display">
              Scientific Sources
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Open-Meteo Weather & CAMS</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://waqi.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>WAQI CPCB Ground Feeds</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://firms.modaps.eosdis.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>NASA FIRMS VIIRS NRT</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">CPCB NAQI Oct 2014 Standard</span>
              </li>
              <li>
                <span className="text-slate-500">US EPA Exposure Factors (2011)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Health Disclaimers */}
        <div className="border-t border-slate-800/60 pt-6 space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-400">Health Notice:</strong> Health and exposure estimates generated by AeroSense AI are strictly for environmental guidance, routine planning, and awareness. They do not constitute clinical diagnosis, medical triage, or personal health prescriptions. Consult certified healthcare professionals for medical conditions.
          </p>
          <p>
            <strong className="text-slate-400">Privacy Assurance:</strong> Family profiles, sensitivities, and bookmarked places are persisted exclusively in your browser&apos;s local IndexedDB and are never transmitted to external servers. All outgoing Gemini AI calls are automatically scrubbed of personal identifiers.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-600 gap-2">
            <span>© 2026 AeroSense AI • PromptWars Challenge 6</span>
            <span>Deterministic Environmental Intelligence Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
