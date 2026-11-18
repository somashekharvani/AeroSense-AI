# Changelog

All notable changes to the AeroSense AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Phase 7: Drone Hardware Ingest Endpoint & Simulated Flight Demo] - 2026-11-18

### Added
- **Drone Telemetry Ingestion Endpoint**: `POST /api/drone/ingest` and `GET /api/drone/ingest` with Zod schema `DronePacketSchema` validating hardware telemetry.
- **Strict Compliance & Gas Trend Safety**: Telemetry enforces hardware safety constraints: MQ-135 is treated as a relative gas response trend only and NEVER feeds the CPCB NAQI calculation.
- **Flight Demo & Connection Status**: Simulated flight telemetry demo (`GET /api/drone/ingest?demo=true`) prominently labelled `SIMULATED` badge; physical drone status reports "Not Connected" until verified live packets arrive.
- **3D Quadcopter Drone Scene**: `components/three/drone-scene.tsx` rendering interactive UAV model with spinning rotors, downward LiDAR/particle sensor scan beam, and telemetry HUD overlay.
- **Testing**: Complete unit testing in `tests/services/drone.test.ts` verifying Zod validation, demo mode responses, simulated badge enforcement, and error rejections.

---

## [Phase 6: Core Pages & Interactive Dashboards] - 2026-11-18

### Added
- **Pillar 1: Know (`app/live/page.tsx`)**:
  - Live Indian CPCB National AQI calculated deterministically from fused pollutant concentrations.
  - Criteria pollutants grid (PM2.5, PM10, NO2, SO2, CO, O3) with sub-index calculations, 24h/8h completeness thresholds, and dominant pollutant identification.
  - Atmospheric profile cards displaying boundary layer height, lapse rate, and inversion status.
  - Incident View alerting on satellite thermal points and estimated downwind dispersion zones.
- **Pillar 2: Predict (`app/forecast/page.tsx`)**:
  - 48-hour hourly outlook strip visualizing air quality progression, boundary layer compression, and nocturnal inversion spikes.
  - Backtest calibration card comparing past forecast hours against ground-truth station observations with MAE, RMSE, and bias metrics.
- **Pillar 3: Protect (`app/family/page.tsx`)**:
  - Per-person inhaled PM2.5 dose calculator ($\mu\text{g}$) parameterized by age-appropriate EPA ventilation rates.
  - Privacy-preserving family profile manager stored exclusively on-device in IndexedDB (`idb-keyval`).
  - WHO guideline daily dose threshold comparison and approximate cigarette smoke equivalence.
- **Clean-Air Planner (`app/planner/page.tsx`)**:
  - Interactive 24-hour routine planner combining hourly air quality, clean-air ventilation windows, and priority actionable recommendations.
  - Strict fact citation viewer allowing users to audit every recommendation against scientific facts.
- **Pillar 4: Home (`app/indoor/page.tsx`)**:
  - Real-time indoor air mass-balance differential equation solver computing steady-state and transient PM2.5 concentrations.
  - Dynamic 3D cutaway room visualization (`components/three/indoor-room-scene.tsx`) with animated outdoor infiltration, cooking emissions, and HEPA purifier CADR exhaust cone.
  - Ventilate-or-seal decision matrix, purifier CADR sizing calculator based on room volume and target air changes per hour (ACH), and DIY Corsi-Rosenthal box builder specs.
- **Pillar 5: Act (`app/what-if/page.tsx`)**:
  - What-If simulator evaluating three actionable sustainability scenarios: commute modal shift (petrol 2-wheeler vs metro vs electric bus), cooking fuel (chulha/biomass vs LPG/induction), and air purifier operation.
  - Auditable `ImpactReceiptCard` for every simulated action showing exact reduction, baseline, alternative, method, assumptions, and confidence.
- **Community & Decision Score (`app/community/page.tsx`)**:
  - Clean-Air Decision Score calculator (0-100) scoring verifiable household proactive actions (purifier usage, sealed windows, clean commute, low-emission cooking) with strictly zero clinical health diagnosis.
  - Sector-specific advisories for vulnerable groups (schools, senior citizens, construction managers, municipal waste monitors).
- **AI Copilot (`app/copilot/page.tsx`)**:
  - Interactive air quality conversational assistant grounded exclusively in validated environmental facts.
  - System prompt injection defense and offline fallback mode ensuring uninterrupted guidance.
- **Spatial Map (`app/map/page.tsx`)**:
  - OpenStreetMap spatial radar showing user location, nearby CPCB monitoring stations, distance rings (10km, 25km, 50km), wind direction transport vector, and active NASA FIRMS fire detections with downwind estimate arcs.

---

## [Phase 5: 3D Atmospheric Inversion & Experience] - 2026-11-18

### Added
- **Three.js & React Three Fiber Engine**: Embedded 3D environmental visualization stack (`three`, `@react-three/fiber`, `@react-three/drei`).
- **Mathematical Particle & Boundary Layer Mapping**: `components/three/scene-math.ts` mapping physical metrics (PM2.5 concentration, CPCB AQI color bands, boundary layer height in meters) to particle density, velocity, and vertical compression ceiling height.
- **3D Atmospheric Inversion Scene**: `components/three/atmosphere-scene.tsx` rendering ground plane, particulate cloud, wind vector drift, and glowing inversion lid ceiling illustrating thermal trapping.
- **WebGL Capability & Accessibility Guard**: `components/three/canvas-container.tsx` detecting WebGL support, honoring `prefers-reduced-motion`, and providing seamless fallback to 2D accessible charts.
- **Hydration Safety**: Dynamic client-only exports (`ssr: false`) preventing Next.js SSR hydration mismatches.

---

## [Phase 4: Gemini Planner, Fact Validator & Resilient Fallback] - 2026-11-18

### Added
- **Official Google GenAI SDK**: Integrated `@google/genai` with model configuration via `GEMINI_MODEL` (`gemini-2.5-flash` default).
- **Zero Number Fabrication & Strict Fact Citation Validator**: `lib/validation/fact-validator.ts` extracts all numerical claims (including Indic numerals via `normalizeNumerals`) and rejects any response containing numbers not present in the authorized `FactsObject` or citing hallucinated fact IDs.
- **Privacy Redaction & Prompt Injection Guard**: `lib/privacy/redact.ts` scrubs PII (emails, phone numbers), maps family members to privacy-preserving demographic tokens (`Member 1 (child)`), and blocks prompt injection/jailbreak attempts.
- **Deterministic Offline Fallback Planner**: `engines/fallback-planner.ts` produces 100% offline, verified 24-hour routines, clean-air windows, and actionable recommendations with fact citations when Gemini is unavailable, rate-limited, or fails validation.
- **Strict Plan Schema**: `lib/validation/plan-schema.ts` defining `GeminiPlanResponseSchema`, `HourlyRoutineItemSchema`, and `RecommendationItemSchema`.
- **Gemini Service**: `services/gemini.ts` orchestrating prompt assembly with system constraints, timeout enforcement (9s), Zod schema parsing, fact validation, and automatic fallback.
- **API Route**: `POST /api/plan` (`app/api/plan/route.ts`) orchestrating demographic sanitization, dynamic engine fact generation, Gemini planning, and graceful fallback.
- **Testing**: 5 new test suites with 16 new tests (total 20 test files, 112 passing tests) and 0 TypeScript errors.

---

## [Phase 3: Live Data Services, Fusion & Caching] - 2026-11-18

### Added
- **Third-Party API Clients**:
  - `services/open-meteo.ts`: Fetches weather, atmospheric profile (boundary layer height, geopotential heights, pressure levels 925 & 850 hPa), and European CAMS 6-pollutant air quality model with unit conversion (CO $\mu\text{g/m}^3 \to \text{mg/m}^3$) and exponential backoff retry.
  - `services/waqi.ts`: Fetches CPCB real-time ground station telemetry from WAQI feed with Haversine distance ranking and source attributions.
  - `services/nasa-firms.ts`: Fetches and parses active thermal anomaly detections from NASA FIRMS VIIRS NRT satellites over a 110km bounding box with safe CSV parsing and confidence categorization (`low`, `nominal`, `high`).
  - `services/geocoding.ts`: Forward and reverse geocoding via Open-Meteo Geocoding API with 1-month memory caching.
- **Sensor Fusion Engine**: `lib/fusion.ts` combining station observations and model reanalysis via Inverse-Distance Weighting (IDW), observation quality scoring (distance, age, completeness), divergence detection ($>35\%$), and confidence scoring (`high`, `medium`, `low`).
- **Incident View & Downwind Sector Engine**: `engines/incident.ts` analyzing NASA FIRMS fire detections, wind transport direction ($\theta + 180^\circ$), horizontal Gaussian plume dispersion cone ($\pm 35^\circ$), and flagging downwind ground stations with explicit `isEstimate: true`.
- **In-Memory Cache & Resilient Fallback**: `lib/caching/cache.ts` providing TTL-based storage with stale-while-revalidate fallback so the application stays functional when upstream APIs experience downtime.
- **Security & Rate Limiting**: `lib/security/rate-limit.ts` providing in-memory sliding token bucket limiting clients to 60 requests per minute with `Retry-After` headers.
- **API Routes**:
  - `GET /api/snapshot`: Orchestrates concurrent upstream fetches, runs data fusion, Indian AQI, Inversion Risk, and Incident View engines, and returns unified telemetry with cache control headers (`X-Cache: HIT | MISS | STALE`).
  - `GET /api/forecast`: Provides 48-hour outlook and backtest metric evaluation (forecast vs. station observation pairs).
  - `GET /api/stations`: Returns nearby ground stations with distance and pollutants.
  - `GET /api/fires`: Returns active satellite thermal points within the target radius.
- **Client Hooks & UI Components**:
  - `hooks/use-snapshot.ts`: React hook for telemetry with SWR caching, error states, and stale fallback flags.
  - `components/dashboard/source-status-strip.tsx`: Live telemetry status badges showing Open-Meteo, WAQI, NASA FIRMS, and Drone ("Not Connected").
  - `components/dashboard/backtest-panel.tsx`: Backtest validation card showing MAE, RMSE, and bias against station ground truth.
  - Updated home dashboard (`app/page.tsx`) with live sensor fusion data.
- **Testing**: 15 test suites and 96 passing unit and integration tests with zero TypeScript errors.

---

## [Phase 2: Schemas & Scientific Deterministic Engines] - 2026-11-18

### Added
- **Shared Zod Schemas**: `lib/validation/schemas.ts` defining `PollutantReading`, `CriteriaPollutants`, `WeatherHour`, `AtmosphereProfile`, `SourceObservation`, `FusedAirState`, `FamilyMember`, `Room`, `FactsObject`, and `ImpactReceipt`.
- **CPCB Breakpoints Configuration**: `engines/config/cpcb-breakpoints.ts` implementing official CPCB (2014) National Air Quality Index breakpoints for PM2.5, PM10, NO2, SO2, CO, O3, NH3, Pb.
- **Scientific Assumptions Registry**: `engines/config/assumptions.ts` and `docs/assumptions.md` cataloging breathing rates, transit emission factors, building physics, and inversion weights with citations and verification status flags.
- **CPCB NAQI Engine**: `engines/indian-aqi.ts` with linear interpolation inside breakpoint bands, monotonicity guarantees, 16/24h and 6/8h completeness thresholds, and 3-pollutant / PM requirement flags (`isPartial`).
- **Thermal Inversion Risk Engine**: `engines/inversion.ts` calculating vertical lapse rates from 925 & 850 hPa geopotential heights above ground, composite 0-100 risk score, and confidence scores.
- **Exposure Dose Engine**: `engines/exposure.ts` calculating cumulative inhaled PM2.5 mass doses ($\mu\text{g}$) using EPA Exposure Factors Handbook ventilation rates, WHO daily budget comparisons, and approximate cigarette equivalence.
- **Indoor Air Mass-Balance Engine**: `engines/indoor-air.ts` solving first-order ODE for indoor PM2.5, steady-state concentration, transient hourly steps, purifier sizing ($ACH \times V$), and Corsi-Rosenthal DIY box estimates.
- **Impact Quantification Engine**: `engines/impact.ts` generating validated `ImpactReceipt` records for scooter vs metro, car vs bus, cooking fuel transitions, and HEPA air purifiers.
- **Clean-Air Decision Score Engine**: `engines/decision-score.ts` providing a 0-100 score evaluating household actions without clinical health claims.
- **Forecasting Metrics Engine**: `engines/forecasting.ts` implementing MAE, RMSE, Bias, and BLH column compression scaling.
- **Facts Builder & Multilingual Normalizer**: `lib/facts.ts` converting engine outputs to stable fact IDs and normalizing Devanagari, Bengali, Gurmukhi, Gujarati, Tamil, Telugu, Kannada, Malayalam, and Arabic-Indic numerals to ASCII digits.
- **Documentation**: `docs/engines.md` and `docs/assumptions.md`.
- **Testing**: 82 passing Vitest unit tests covering all 7 engines and validation rules.

---

## [Phase 1: Foundation, Design System, Languages & Location] - 2026-11-18

### Added
- **Project Structure**: Next.js 15, React 19, TypeScript strict mode, Tailwind CSS v4, Lucide React, Zod, and next-intl.
- **Master Prompt & AGENTS.md**: Rules governing deterministic science, Impact Receipts, source fusion, and safety policies.
- **Design System Tokens**: Ink background layers, emerald/teal accents, visible focus rings, reduced-motion overrides, and high-contrast styling.
- **CPCB 6-Step AQI Scale**: `AQIBadge` component mapping Good, Satisfactory, Moderate, Poor, Very Poor, and Severe with color, value, icon, and text label.
- **Auditable Badges**: `ConfidenceBadge` (High, Medium, Low) and `SourceBadge` (Model, Station, Satellite, Drone, SIMULATED).
- **Impact Receipt Shell**: Expandable `ImpactReceiptCard` presenting baseline, clean alternative, change with units, method, assumptions, fact IDs, and engine signature.
- **11 Languages & RTL**: Full translations for en, hi, kn, ta, te, ml, mr, bn, gu, pa, ur with instant switching and `messages/glossary.json`.
- **Multi-Modal Location Selection**: Search, GPS with privacy rounding, 12 presets, 5 saved places in IndexedDB, and URL query synchronization.
- **Navigation & 10 Core Pages**: Mapped routes with responsive sidebar, header, and mobile bottom navigation.
