# Changelog

All notable changes to the AeroSense AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
