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
Create `.env.local` and add server-side keys (never exposed to the browser):
```bash
# Google Gemini API Key & Model
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# WAQI (World Air Quality Index) Token for CPCB Ground Station Telemetry
WAQI_TOKEN=your_waqi_token_here

# NASA FIRMS Map Key for VIIRS NRT Satellite Active Fire Points
FIRMS_MAP_KEY=your_firms_map_key_here

# Optional: Hardware Drone Ingest Shared Secret
DRONE_INGEST_SECRET=your_optional_secret_here
```
*Note: If API keys are omitted, the application uses Open-Meteo (free, keyless) and deterministic fallbacks with full functionality.*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Testing
```bash
# 1. Run All 120 Unit & Integration Tests (Vitest)
npm run test:unit

# 2. Strict TypeScript Typecheck
npm run typecheck

# 3. Production Build
npm run build
```

---

## Complete Page & Feature Tour

| Route | Pillar / Feature | Highlights |
| :--- | :--- | :--- |
| `/` | **Overview** | Atmospheric 3D Inversion Scene, live CPCB AQI summary, quick cards for all 5 pillars, and source telemetry strip. |
| `/live` | **Pillar 1: Know** | Live Indian CPCB National AQI, criteria pollutants breakdown (PM2.5, PM10, NO2, SO2, CO, O3), atmospheric profile, and incident alerts. |
| `/forecast` | **Pillar 2: Predict** | 48-hour hourly outlook strip, nocturnal inversion compression spikes, boundary-layer dynamics, and backtest calibration panel (MAE, RMSE, bias). |
| `/family` | **Pillar 3: Protect** | On-device IndexedDB family manager, per-person inhaled PM2.5 dose ($\mu\text{g}$), WHO daily budget limits, and cigarette smoke equivalents. |
| `/planner` | **Clean-Air Planner** | AI-generated or deterministic offline 24-hour routine, clean-air ventilation windows, actionable recommendations, and scientific fact audit viewer. |
| `/indoor` | **Pillar 4: Home** | Interactive 3D room cutaway with window infiltration and purifier plume, mass-balance differential equation solver, ventilate-vs-seal decision, CADR calculator, and Corsi-Rosenthal DIY box specs. |
| `/what-if` | **Pillar 5: Act** | Interactive modal shift simulator (petrol two-wheeler vs metro vs bus), cooking fuel cleaner transitions, and purifier operation with auditable **Impact Receipts**. |
| `/community` | **Community** | Clean-Air Decision Score calculator (0-100 score strictly of household actions, zero clinical claims), and sectoral advisories for schools, seniors, and site managers. |
| `/copilot` | **AI Copilot** | Fact-grounded environmental assistant powered by Gemini 2.5 Flash, system prompt injection filtering, strict fact citations, and deterministic offline fallback. |
| `/map` | **Spatial Radar** | OpenStreetMap radar showing 10/25/50km distance rings, nearby monitoring stations, wind transport vectors, and NASA FIRMS fire detections with estimated downwind arcs. |
| `/api/drone/ingest`| **AeroSense Drone** | UAV telemetry ingestion endpoint (`POST`) and simulated flight demo (`GET ?demo=true`) with Zod schema validation and `SIMULATED` badge. |

---

## Vercel Deployment

AeroSense AI is designed for seamless deployment on Vercel:

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Configure the Environment Variables in the Vercel Project Settings:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (`gemini-2.5-flash`)
   - `WAQI_TOKEN` (optional for live CPCB stations)
   - `FIRMS_MAP_KEY` (optional for live NASA FIRMS active fires)
4. Deploy! All API keys remain strictly on the server-side Next.js route handlers.

---

## Status Report

### What Works
- **Deterministic Scientific Engines**: 7 pure mathematical engines (`indian-aqi`, `inversion`, `exposure`, `indoor-air`, `impact`, `forecasting`, `decision-score`, `incident`) running with zero network dependencies.
- **Auditable Impact Receipts**: Complete mathematical tracking for all simulated decisions (action, baseline, alternative, change with units, assumptions, confidence level, engine version).
- **Gemini Planner & Strict Fact Validator**: `@google/genai` integration with zero number fabrication validator, system prompt injection protection, demographic sanitization, and automatic offline fallback.
- **3D Atmospheric & Indoor Visualizations**: Three.js/Fiber/Drei scenes for atmospheric thermal inversion, interactive room mass-balance cutaway, and drone telemetry HUD. Full accessibility toggle and `prefers-reduced-motion` support.
- **11 Languages & RTL**: Flawless switching across English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, and Urdu (with bidirectional `dir="rtl"` layout).
- **Comprehensive Test Suite**: 22 test files with 120 passing unit/integration tests and zero TypeScript errors (`tsc --noEmit`).
- **Drone Telemetry Endpoint**: Compliant Zod-validated hardware API with simulated flight demo and strict safety rules (MQ135 treated as relative gas trend only; never feeds NAQI).

### What is Simulated
- When external API keys (`WAQI_TOKEN`, `FIRMS_MAP_KEY`) are not supplied in `.env.local`, the system automatically falls back to Open-Meteo CAMS models and clearly marks sample satellite anomalies with `SIMULATED` or `ESTIMATE` badges.
- `/api/drone/ingest?demo=true` generates simulated quadcopter flight telemetry with an explicit `SIMULATED` badge and "Not Connected" status for physical hardware.

### What is Unverified
- The 10 non-English translation files (`messages/*.json`) are functional and cover 100% of keys, but retain `"needsNativeReview": true` awaiting final review by native Indian language speakers for nuanced colloquial health expressions.
- The default physical building infiltration coefficients and vehicle emission factors live in `engines/config/assumptions.ts` with explicit source citations and `"verified": false` flags pending local municipal calibration.
