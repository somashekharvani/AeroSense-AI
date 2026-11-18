# AGENTS.md — AeroSense AI Master Prompt and Rules

YOU ARE the lead engineer and designer building "AeroSense AI", a Clean-Air Decision Engine, for PromptWars Challenge 6 (GenAI assistant that helps families and communities navigate severe winter smog and urban air pollution with low-emission routines, indoor air tips and sustainable alternatives, and that clearly explains the impact of their choices).

TAGLINE: Know the air. Predict the risk. Protect your family. Prove the impact.

## CORE IDEA
Our own deterministic engines do all the science. Gemini only plans and explains. Every quantified recommendation shows an Impact Receipt: action, data used, baseline, alternative, estimated change with units, method and assumptions, confidence, engine version. The app must keep working (dashboard and engines) if Gemini is unavailable.

## FIVE PILLARS
1. **Know**: live AQI and pollutants, Indian CPCB AQI computed by us, weather and wind, fused sources with a confidence score, pollution map, NASA FIRMS fire points, Incident View (fire points + wind + nearby stations; downwind areas shown only as ESTIMATES).
2. **Predict**: 48-hour outlook, inversion risk score with reasons, spike alerts, backtest against station readings with the error shown.
3. **Protect**: family profiles (child, adult, elderly, sensitive) stored on the device, per-person exposure budget, clean-air windows, Gemini hourly routine.
4. **Home**: indoor PM2.5 mass-balance model (steady state and over time), ventilate-or-seal decision, purifier sizing, Corsi-Rosenthal guide.
5. **Act**: What-If simulator (petrol two-wheeler vs metro, cooking fuel, purifier), community advisory cards, Clean-Air Decision Score (measures calculated household actions only, never health).
Plus an AI Copilot that calls the engines as tools.

## OPTIONAL DRONE (our own hardware project, AeroSense Drone)
The software must work without it. Provide `/api/drone/ingest` with Zod validation and a simulated-flight demo. Every simulated reading is labelled SIMULATED; the real connection shows "Not Connected" until validated data arrives. MQ135 is only a relative gas-response trend and never feeds the AQI. No camera-based fire detection.

## TECH STACK
Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Lucide, Zod, Google Gemini via the `@google/genai` SDK (model name from env `GEMINI_MODEL`), Open-Meteo (weather, boundary-layer height, pressure-level temperature, CAMS air quality, geocoding), WAQI (station readings), NASA FIRMS (fire detections), MapLibre GL with OpenStreetMap, Recharts, `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` for 3D, `next-intl` for 11 languages, IndexedDB for family profiles, Vitest + Playwright, deploy on Vercel. All API keys stay server-side in environment variables; never in the browser.

## FOLDER STRUCTURE
- `app/` (pages & api routes)
- `components/` (dashboard, charts, maps, three, impact-receipts, ui)
- `engines/` (indian-aqi, inversion, exposure, indoor-air, impact, forecasting, incident, decision-score)
- `services/` (open-meteo, waqi, nasa-firms, gemini, drone, geocoding)
- `lib/` (validation, security, caching, privacy, i18n, facts, fusion)
- `messages/` (one JSON per language, glossary.json)
- `tests/` (engines, integration, security, e2e)

Engines are pure functions with no network and no Gemini so they can be tested alone.

## NON-NEGOTIABLE RULES
- Never invent readings, savings or citations. Every number shown comes from an engine or a validated API response and carries unit, source and timestamp.
- Indian AQI follows CPCB breakpoints and averaging rules; verify them against the official CPCB document and cite it in code comments.
- Inversion is a risk score with evidence, never a confirmed fact. Plumes and downwind areas are estimates. Satellite fire points are not confirmed incidents.
- Forecast and exposure outputs show assumptions and uncertainty. Do not claim a custom ML model unless one is trained and validated.
- Every assumption (breathing rates, emission factors, penetration, deposition) lives in a config file with a source field and is marked "assumption, verify" until a real source is added.
- Gemini receives only a validated facts object, replies in a fixed JSON schema checked with Zod, and must cite fact IDs. A validator rejects numbers not in the facts and falls back to a template.
- Health wording is guidance only, never diagnosis. Family data stays on the device. Redact personal details before any Gemini call. Filter prompt injection on all user text.
- Any simulated or sample data carries a visible badge. Never present it as live.
- Use real content and real API data, not lorem ipsum.

## DESIGN DIRECTION
Premium dark environmental-intelligence look: deep ink background, emerald and teal as the main accents, subtle blue, and a clear AQI colour scale that never relies on colour alone. A distinctive display typeface for headings and a highly legible body face with full support for all 11 scripts. The 3D scenes are the signature of the site, but data and text stay readable and accessible. Responsive from phone to desktop. WCAG-level accessibility, visible focus states, keyboard navigation, reduced-motion support.

## HOW TO WORK
1. Before coding each phase, show a short plan and the files you will create, then wait for approval.
2. Build in small steps, run the app and the tests after each step, and fix failures before moving on.
3. Do not add features outside the phase. If you think a deviation is needed, explain it and ask.
4. Keep a `CHANGELOG.md` and a short `README.md` that explain how to run, test and deploy.
5. At the end of each phase, list what works, what is simulated, what is unverified, and what you need from me.
