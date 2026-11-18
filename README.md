# AeroSense AI — Clean-Air Decision Engine

> **Tagline**: *Know the air. Predict the risk. Protect your family. Prove the impact.*

Built for **PromptWars Challenge 6**: GenAI assistant that helps families and communities navigate severe winter smog and urban air pollution with low-emission routines, indoor air tips and sustainable alternatives, clearly explaining the impact of their choices.

---

## Architecture & Core Philosophy

Our own **deterministic engines** do all the science. Gemini only plans and explains. Every quantified recommendation displays an **Impact Receipt** containing the exact mathematical method, data used, baseline, alternative, estimated change with units, assumptions, confidence level, and deterministic engine version. The app continues functioning (dashboard and scientific models) even if Gemini or external LLMs are unavailable.

### Five Pillars
1. **Know**: Live AQI and pollutants calculated from raw data following official Indian CPCB breakpoints; weather, boundary-layer height, fused sources with confidence scoring; NASA FIRMS satellite fire points; Incident View with downwind sectors (labelled ESTIMATES).
2. **Predict**: 48-hour outlook, thermal inversion risk score (925 & 850 hPa temperature gradients vs surface), spike alerts, and station backtesting.
3. **Protect**: Family profiles stored on-device (IndexedDB), per-person exposure budgets, clean-air windows, and hourly routines.
4. **Home**: Indoor PM2.5 mass-balance differential equation model, ventilate-or-seal decisions, purifier CADR sizing, and Corsi-Rosenthal DIY box guide.
5. **Act**: What-If simulator (petrol two-wheeler vs metro, cooking fuel options, air purifiers), community advisories, and the Clean-Air Decision Score.

---

## Multilingual Support (11 Languages)

AeroSense AI supports 11 Indian and regional languages with native typography and bidirectional layout mirroring:

| Code | Language | Script | Direction | Translation Review Status |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | Latin | LTR | **Canonical Source** |
| `hi` | हिन्दी (Hindi) | Devanagari | LTR | *Machine Translated — Needs Native Review* |
| `kn` | ಕನ್ನಡ (Kannada) | Kannada | LTR | *Machine Translated — Needs Native Review* |
| `ta` | தமிழ் (Tamil) | Tamil | LTR | *Machine Translated — Needs Native Review* |
| `te` | తెలుగు (Telugu) | Telugu | LTR | *Machine Translated — Needs Native Review* |
| `ml` | മലയാളം (Malayalam) | Malayalam | LTR | *Machine Translated — Needs Native Review* |
| `mr` | मराठी (Marathi) | Devanagari | LTR | *Machine Translated — Needs Native Review* |
| `bn` | বাংলা (Bengali) | Bengali | LTR | *Machine Translated — Needs Native Review* |
| `gu` | ગુજરાતી (Gujarati) | Gujarati | LTR | *Machine Translated — Needs Native Review* |
| `pa` | ਪੰਜਾਬੀ (Punjabi) | Gurmukhi | LTR | *Machine Translated — Needs Native Review* |
| `ur` | اردو (Urdu) | Arabic / Naskh | **RTL** | *Machine Translated — Needs Native Review* |

All health, scientific, and air-quality terms are aligned with `messages/glossary.json`.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x (tested on v24.14.1)
- npm >= 10.x

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env.local` and add server-side keys:
```bash
cp .env.example .env.local
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Tests
```bash
# Unit & Translation Parity Tests (Vitest)
npm run test:unit

# Type Check
npm run typecheck

# End-to-End Tests (Playwright)
npm run test:e2e
```

---

## Phase 1 Status Report

### What Works
- **App Shell**: Next.js 15 App Router + React 19 + Tailwind CSS v4 running cleanly in dark environmental-intelligence theme.
- **Design System**: CPCB 6-step AQI scale (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) with guaranteed color-independence (icon + text label + value), `ConfidenceBadge`, `SourceBadge` (Model, Station, Satellite, Drone, SIMULATED), and `ImpactReceiptCard` expandable audit drawer.
- **11 Languages & RTL**: Instant switching between 11 languages without full-page reloads. Layout mirrors properly in Urdu (`dir="rtl"`). 100% key parity verified by 41 Vitest unit tests.
- **Location System**: 4 selection mechanisms (Open-Meteo geocoding search, browser GPS with 2-decimal privacy rounding, 12 preset Indian cities, and saved places manager). State is synchronized with URL query params (`?lat=28.61&lon=77.21&lang=hi`) and persisted in IndexedDB.
- **10 Pages**: All core pages accessible via responsive sidebar on desktop and bottom navigation on mobile.

### What is Simulated
- Overview demo Impact Receipt (`DEMO-001`) displaying the audit shell structure before Phase 2 engines are attached.

### What is Unverified
- The 10 non-English translation files are marked `"needsNativeReview": true` awaiting human native speaker review for nuanced health phrasing.
