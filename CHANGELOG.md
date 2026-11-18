# Changelog

All notable changes to the AeroSense AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
