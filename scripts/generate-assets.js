const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.join(rootDir, 'public', 'images', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 1. Logo SVG
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 160" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="emeraldTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="darkCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1522" />
      <stop offset="100%" stop-color="#060a12" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="760" height="160" rx="24" fill="url(#darkCard)" stroke="#1e293b" stroke-width="1.5" />

  <!-- Icon Hexagon Frame -->
  <g transform="translate(30, 20)">
    <!-- Outer ambient ring -->
    <circle cx="60" cy="60" r="52" stroke="url(#emeraldTeal)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4" />
    
    <!-- Shield / Core Hexagon -->
    <polygon points="60,15 100,38 100,84 60,107 20,84 20,38" fill="#040810" stroke="url(#emeraldTeal)" stroke-width="3" filter="url(#glow)" />
    
    <!-- Atmospheric Wind / Aerodynamic Streamlines -->
    <path d="M35 50 Q60 38 85 52" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <path d="M30 62 Q60 52 90 64" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M38 74 Q60 66 82 76" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85" />
    
    <!-- Sensor Diamond Core -->
    <circle cx="60" cy="62" r="5" fill="#ffffff" filter="url(#glow)" />
    <circle cx="60" cy="62" r="2" fill="#06b6d4" />
    <circle cx="42" cy="51" r="2" fill="#10b981" />
    <circle cx="78" cy="74" r="2" fill="#38bdf8" />
  </g>

  <!-- Brand Typography -->
  <g transform="translate(170, 42)">
    <!-- Brand Title -->
    <text x="0" y="46" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="800" fill="#f8fafc" letter-spacing="-0.5">
      AeroSense
    </text>

    <!-- AI Pill Badge -->
    <rect x="236" y="12" width="62" height="38" rx="10" fill="url(#badgeGrad)" filter="url(#glow)" />
    <text x="267" y="37" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#040914" text-anchor="middle" letter-spacing="0.5">
      AI
    </text>

    <!-- Subtitle / Tagline -->
    <text x="2" y="78" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#06b6d4" letter-spacing="2.8">
      CLEAN-AIR DECISION ENGINE
    </text>

    <!-- Subtle Mission Motto -->
    <text x="380" y="78" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="400" fill="#64748b" letter-spacing="0.8">
      Know • Predict • Protect • Prove
    </text>
  </g>
</svg>`;

// 2. Architecture SVG (Accurate 5-layer diagram)
const archSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 860" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070c14" />
      <stop offset="100%" stop-color="#03060a" />
    </linearGradient>
    <linearGradient id="layerGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="layerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#082f49" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="layerGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#082f49" />
    </linearGradient>
    <linearGradient id="layerGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="layerGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d1522" />
      <stop offset="100%" stop-color="#111c2e" />
    </linearGradient>
    <linearGradient id="accentTeal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Canvas -->
  <rect width="1200" height="860" fill="url(#bgGrad)" />

  <!-- Subtle Blueprint Grid -->
  <g opacity="0.06" stroke="#06b6d4" stroke-width="1">
    <line x1="60" y1="0" x2="60" y2="860" />
    <line x1="200" y1="0" x2="200" y2="860" />
    <line x1="400" y1="0" x2="400" y2="860" />
    <line x1="600" y1="0" x2="600" y2="860" />
    <line x1="800" y1="0" x2="800" y2="860" />
    <line x1="1000" y1="0" x2="1000" y2="860" />
    <line x1="1140" y1="0" x2="1140" y2="860" />
    <line x1="0" y1="80" x2="1200" y2="80" />
    <line x1="0" y1="200" x2="1200" y2="200" />
    <line x1="0" y1="360" x2="1200" y2="360" />
    <line x1="0" y1="520" x2="1200" y2="520" />
    <line x1="0" y1="680" x2="1200" y2="680" />
  </g>

  <!-- Header Banner -->
  <g transform="translate(60, 30)">
    <rect width="1080" height="60" rx="12" fill="#0d1522" stroke="#1e293b" />
    <circle cx="28" cy="30" r="12" fill="#10b981" opacity="0.2" />
    <circle cx="28" cy="30" r="6" fill="#10b981" />
    <text x="50" y="36" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#f8fafc">
      AeroSense AI — 5-Layer Environmental Intelligence System Architecture
    </text>
    <rect x="880" y="16" width="180" height="28" rx="6" fill="#0f172a" stroke="#06b6d4" stroke-width="1" />
    <text x="970" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#38bdf8" text-anchor="middle">
      ZERO HALLUCINATED METRICS
    </text>
  </g>

  <!-- LAYER 1: Ingestion & Telemetry Sources -->
  <g transform="translate(60, 110)">
    <rect width="1080" height="115" rx="14" fill="url(#layerGrad1)" stroke="#334155" stroke-width="1" />
    <rect x="20" y="14" width="220" height="24" rx="4" fill="#1e293b" />
    <text x="28" y="30" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" letter-spacing="0.5">
      LAYER 1 • MULTI-SOURCE INGESTION
    </text>

    <!-- Source Node 1: Open-Meteo -->
    <g transform="translate(20, 48)">
      <rect width="250" height="52" rx="8" fill="#0a0f18" stroke="#0ea5e9" stroke-width="1" />
      <text x="14" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#e0f2fe">Open-Meteo Weather &amp; CAMS</text>
      <text x="14" y="39" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">925/850hPa Lapse, BLH, Wind, CAMS</text>
    </g>

    <!-- Source Node 2: WAQI -->
    <g transform="translate(285, 48)">
      <rect width="250" height="52" rx="8" fill="#0a0f18" stroke="#10b981" stroke-width="1" />
      <text x="14" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#d1fae5">WAQI Station Telemetry</text>
      <text x="14" y="39" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">CPCB/SPCB Ground Monitors (PM2.5/10)</text>
    </g>

    <!-- Source Node 3: NASA FIRMS -->
    <g transform="translate(550, 48)">
      <rect width="250" height="52" rx="8" fill="#0a0f18" stroke="#f59e0b" stroke-width="1" />
      <text x="14" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#fef3c7">NASA FIRMS VIIRS NRT</text>
      <text x="14" y="39" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Satellite Active Fires (FRP, Conf, Lat/Lon)</text>
    </g>

    <!-- Source Node 4: AeroSense Drone -->
    <g transform="translate(815, 48)">
      <rect width="245" height="52" rx="8" fill="#0a0f18" stroke="#a855f7" stroke-width="1" />
      <text x="14" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#f3e8ff">AeroSense Drone Ingest</text>
      <text x="14" y="39" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">REST /api/drone/ingest • Zod Schema</text>
    </g>
  </g>

  <!-- Connectors Layer 1 -> Layer 2 -->
  <path d="M600 225 L600 245" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" />

  <!-- LAYER 2: Fusion, Privacy & Safety Gateway -->
  <g transform="translate(60, 245)">
    <rect width="1080" height="100" rx="14" fill="url(#layerGrad2)" stroke="#0284c7" stroke-width="1" />
    <rect x="20" y="14" width="280" height="24" rx="4" fill="#0c4a6e" />
    <text x="28" y="30" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#7dd3fc" letter-spacing="0.5">
      LAYER 2 • FUSION, PRIVACY &amp; SAFETY GATEWAY
    </text>

    <!-- Gateway Items -->
    <g transform="translate(20, 48)">
      <rect width="330" height="40" rx="6" fill="#041f33" stroke="#0ea5e9" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#e0f2fe">
        Source Fusion &amp; Confidence Scoring
      </text>
    </g>
    <g transform="translate(370, 48)">
      <rect width="330" height="40" rx="6" fill="#041f33" stroke="#10b981" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">
        On-Device IndexedDB (Family Privacy Sandbox)
      </text>
    </g>
    <g transform="translate(720, 48)">
      <rect width="340" height="40" rx="6" fill="#041f33" stroke="#f43f5e" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#ffe4e6">
        Prompt Injection Shield &amp; Demographic Redaction
      </text>
    </g>
  </g>

  <!-- Connectors Layer 2 -> Layer 3 -->
  <path d="M600 345 L600 365" stroke="#10b981" stroke-width="2" />

  <!-- LAYER 3: Deterministic Scientific Engines -->
  <g transform="translate(60, 365)">
    <rect width="1080" height="150" rx="14" fill="url(#layerGrad3)" stroke="#059669" stroke-width="1.5" />
    <rect x="20" y="14" width="370" height="24" rx="4" fill="#064e3b" />
    <text x="28" y="30" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#a7f3d0" letter-spacing="0.5">
      LAYER 3 • DETERMINISTIC SCIENTIFIC ENGINES (PURE TS)
    </text>
    <rect x="800" y="14" width="260" height="24" rx="4" fill="#042f2e" stroke="#10b981" stroke-width="1" />
    <text x="930" y="30" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#34d399" text-anchor="middle">
      100% OFFLINE • ZERO LLM DEPENDENCY
    </text>

    <!-- Engine Grid -->
    <g transform="translate(20, 48)">
      <!-- Row 1 -->
      <g transform="translate(0, 0)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">1. Indian CPCB NAQI Engine</text>
      </g>
      <g transform="translate(265, 0)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">2. Atmospheric Inversion Risk</text>
      </g>
      <g transform="translate(530, 0)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">3. Indoor PM2.5 Mass-Balance ODE</text>
      </g>
      <g transform="translate(795, 0)">
        <rect width="245" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">4. Inhaled Exposure Budget</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 46)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">5. What-If Modal Impact Engine</text>
      </g>
      <g transform="translate(265, 46)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">6. 48h Outlook &amp; Backtest Bias</text>
      </g>
      <g transform="translate(530, 46)">
        <rect width="250" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">7. Incident &amp; Downwind Arcs</text>
      </g>
      <g transform="translate(795, 46)">
        <rect width="245" height="38" rx="6" fill="#032219" stroke="#10b981" stroke-width="0.8" />
        <text x="10" y="23" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#d1fae5">8. Clean-Air Decision Score</text>
      </g>
    </g>
  </g>

  <!-- Connectors Layer 3 -> Layer 4 -->
  <path d="M600 515 L600 535" stroke="#a855f7" stroke-width="2" />

  <!-- LAYER 4: Fact Registry & Strict Audit Verification -->
  <g transform="translate(60, 535)">
    <rect width="1080" height="100" rx="14" fill="url(#layerGrad4)" stroke="#7c3aed" stroke-width="1" />
    <rect x="20" y="14" width="370" height="24" rx="4" fill="#3b0764" />
    <text x="28" y="30" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e9d5ff" letter-spacing="0.5">
      LAYER 4 • FACT REGISTRY &amp; STRICT AUDIT VERIFICATION
    </text>

    <!-- Layer 4 Nodes -->
    <g transform="translate(20, 48)">
      <rect width="330" height="40" rx="6" fill="#1e1035" stroke="#a855f7" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f3e8ff">
        Structured Facts Builder (Numbered Fact IDs)
      </text>
    </g>
    <g transform="translate(370, 48)">
      <rect width="330" height="40" rx="6" fill="#1e1035" stroke="#a855f7" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f3e8ff">
        Impact Receipts (Baseline, Delta, Assumptions)
      </text>
    </g>
    <g transform="translate(720, 48)">
      <rect width="340" height="40" rx="6" fill="#1e1035" stroke="#f43f5e" stroke-width="0.8" />
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#ffe4e6">
        Gemini Anti-Hallucination Fact Validator
      </text>
    </g>
  </g>

  <!-- Connectors Layer 4 -> Layer 5 -->
  <path d="M600 635 L600 655" stroke="#06b6d4" stroke-width="2" />

  <!-- LAYER 5: Presentation & Interactive Intelligence -->
  <g transform="translate(60, 655)">
    <rect width="1080" height="150" rx="14" fill="url(#layerGrad5)" stroke="#0ea5e9" stroke-width="1.2" />
    <rect x="20" y="14" width="370" height="24" rx="4" fill="#082f49" />
    <text x="28" y="30" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#bae6fd" letter-spacing="0.5">
      LAYER 5 • PRESENTATION &amp; DECISION INTELLIGENCE
    </text>

    <!-- Presentation Grid -->
    <g transform="translate(20, 48)">
      <g transform="translate(0, 0)">
        <rect width="200" height="82" rx="8" fill="#050d18" stroke="#38bdf8" stroke-width="0.8" />
        <text x="12" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e0f2fe">Gemini 2.5 Flash</text>
        <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Personalized Daily Planner</text>
        <text x="12" y="60" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Fact-Grounded AI Copilot</text>
      </g>

      <g transform="translate(215, 0)">
        <rect width="200" height="82" rx="8" fill="#050d18" stroke="#10b981" stroke-width="0.8" />
        <text x="12" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#d1fae5">Three.js / R3F Visuals</text>
        <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Atmospheric Inversion 3D</text>
        <text x="12" y="60" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Interactive Room Cutaway</text>
      </g>

      <g transform="translate(430, 0)">
        <rect width="200" height="82" rx="8" fill="#050d18" stroke="#06b6d4" stroke-width="0.8" />
        <text x="12" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#cffafe">MapLibre GL Radar</text>
        <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Spatial Distance Rings</text>
        <text x="12" y="60" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Wind Plume Dispersion Arc</text>
      </g>

      <g transform="translate(645, 0)">
        <rect width="200" height="82" rx="8" fill="#050d18" stroke="#f59e0b" stroke-width="0.8" />
        <text x="12" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#fef3c7">11 Languages + RTL</text>
        <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">English &amp; 10 Indian Scripts</text>
        <text x="12" y="60" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Urdu Bi-Directional Mirror</text>
      </g>

      <g transform="translate(860, 0)">
        <rect width="180" height="82" rx="8" fill="#050d18" stroke="#6366f1" stroke-width="0.8" />
        <text x="12" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e0e7ff">Next.js 15 App</text>
        <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">React 19 &amp; Tailwind v4</text>
        <text x="12" y="60" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">10 Core Dedicated Routes</text>
      </g>
    </g>
  </g>

  <!-- Footer Branding -->
  <g transform="translate(60, 825)">
    <text x="0" y="15" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">
      AeroSense AI by Somashekhar Vani • Built for PromptWars Challenge 6 • Deterministic Environmental Intelligence
    </text>
    <text x="1080" y="15" font-family="system-ui, sans-serif" font-size="11" fill="#10b981" text-anchor="end">
      Know • Predict • Protect • Prove
    </text>
  </g>
</svg>`;

fs.writeFileSync(path.join(rootDir, 'public', 'images', 'logo.svg'), logoSvg, 'utf8');
console.log('Successfully generated public/images/logo.svg');

fs.writeFileSync(path.join(rootDir, 'public', 'architecture', 'architecture.svg'), archSvg, 'utf8');
console.log('Successfully generated public/architecture/architecture.svg');
