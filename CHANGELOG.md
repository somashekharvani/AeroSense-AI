# Changelog

All notable changes to the AeroSense AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Phase 1: Foundation, Design System, Languages & Location] - 2026-11-18

### Added
- **Project Structure**: Next.js 15, React 19, TypeScript strict mode, Tailwind CSS v4, Lucide React, Zod, and next-intl.
- **Master Prompt & AGENTS.md**: Rules governing deterministic science, Impact Receipts, source fusion, and safety policies.
- **Design System Tokens**: Ink background layers, emerald/teal accents, visible focus rings, reduced-motion overrides, and high-contrast styling.
- **CPCB 6-Step AQI Scale**: `AQIBadge` component mapping Good, Satisfactory, Moderate, Poor, Very Poor, and Severe with color, value, icon, and text label.
- **Auditable Badges**: `ConfidenceBadge` (High, Medium, Low) and `SourceBadge` (Model, Station, Satellite, Drone, SIMULATED).
- **Impact Receipt Shell**: Expandable `ImpactReceiptCard` presenting baseline, clean alternative, change with units, method, assumptions, fact IDs, and engine signature.
- **11 Languages & RTL**:
  - Full translations in `messages/` for English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, and Urdu.
  - Directional layout mirroring (`dir="rtl"`) for Urdu.
  - Terminology consistency file `messages/glossary.json`.
  - Client-side `LanguageProvider` with instant switching without page reload.
- **Multi-Modal Location Selection**:
  - Geocoding search via Open-Meteo API.
  - Browser Geolocation API with 2-decimal privacy coordinate rounding.
  - 12 Indian urban preset hubs (Delhi, Gurugram, Noida, Lucknow, Kolkata, Mumbai, Pune, Ahmedabad, Bengaluru, Hyderabad, Chennai, Patna).
  - Up to 5 saved locations with IndexedDB device persistence (`idb-keyval`).
  - URL synchronization with Zod validation (`?lat=28.61&lon=77.21&lang=hi`).
- **Navigation & 10 Core Pages**:
  - Sticky header, responsive desktop sidebar, and phone bottom navigation.
  - Overview (`/`), Live Air (`/live`), Map (`/map`), Family (`/family`), Planner (`/planner`), Indoor Air (`/indoor`), What-If (`/what-if`), Forecast (`/forecast`), Community (`/community`), Copilot (`/copilot`), Settings modal.
- **Testing**:
  - Vitest test suite with 41 passing tests covering translation parity, URL validation, and location storage constraints.
  - Playwright end-to-end spec covering first-run flow, Hindi/Urdu RTL switching, and location picker.
