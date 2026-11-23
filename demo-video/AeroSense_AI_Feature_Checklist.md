# AeroSense AI — Complete Feature & Route Inventory Checklist

> **Project**: AeroSense AI — Clean-Air Decision Engine  
> **Tagline**: *Know the Air. Predict the Risk. Protect Your Family. Prove the Impact.*  
> **Target Demo City**: Bengaluru (12.97°N, 77.59°E) • Secondary Reference: Delhi-NCR (28.61°N, 77.21°E)  
> **Verification Status**: 100% Audited from Source Code and Live Running Application  

---

## 1. Application Routes & Navigation Matrix

| # | Route | Feature Area | Implemented Components & Interactions | Data Classification |
| :-: | :--- | :--- | :--- | :--- |
| **01** | `/` | **Landing Page / Hero** | • Brand hero with tagline & mission statement<br>• Real-time quick snapshot preview<br>• Core capability highlights (Know, Predict, Protect, Home, Act)<br>• Call-to-action buttons ("Launch Dashboard", "Explore Live Air")<br>• Visual atmospheric stream aesthetic | Mixed (Real API preview + Static presentation) |
| **02** | `/overview` | **Overview Dashboard** | • 3D Atmospheric Inversion Scene (`AtmosphereScene`)<br>• Live Indian CPCB NAQI Hero KPI badge & Category<br>• Criteria Pollutants Strip (PM2.5, PM10, NO2, SO2, CO, O3)<br>• Atmospheric condition card (Temp, Humidity, Wind, BLH)<br>• Quick navigation cards to all 5 pillars<br>• Source status strip (Open-Meteo, CPCB, WAQI, FIRMS, Drone) | **Verified Real Data** (Open-Meteo + CPCB Engine) |
| **03** | `/live` | **Pillar 1: Know** | • City selector (Bengaluru, Delhi, Mumbai, Kolkata, Chennai, Custom Coordinates)<br>• Indian CPCB AQI Calculation Card with dominant pollutant<br>• Sub-index breakdown table for all 6 criteria pollutants<br>• Boundary-Layer Height & 10m Wind Vector HUD<br>• Model Reanalysis vs. Station Telemetry source indicators<br>• Source confidence score and latency timestamp | **Verified Real Data** (Modeled CAMS + CPCB Breakpoints) |
| **04** | `/map` | **Spatial Radar** | • MapLibre GL vector canvas with OpenStreetMap tiles<br>• 10 km, 25 km, and 50 km concentric range rings<br>• Wind transport direction arrow and speed<br>• NASA FIRMS satellite thermal anomaly hotspots<br>• Estimated downwind dispersion plume arc (35° spread)<br>• Nearby ground stations in plume sector | **Real Data + Mathematical Estimate** (Plume is labeled ESTIMATE) |
| **05** | `/forecast` | **Pillar 2: Predict** | • 48-Hour forward hourly pollutant concentration curves<br>• Boundary-layer height diurnal cycle overlay<br>• Nocturnal atmospheric inversion trap warnings<br>• Atmospheric lapse rate stability gauge ($\Gamma = -\Delta T/\Delta z$)<br>• Historical Backtesting Calibration Panel (MAE, RMSE, Bias) | **Forecast Model** (Open-Meteo CAMS forecast) |
| **06** | `/family` | **Pillar 3: Protect** | • On-device IndexedDB family manager (Add/Edit/Delete profile)<br>• Demographic vulnerability profiles (Child, Adult, Elderly, Asthmatic)<br>• Per-person Inhaled PM2.5 Dose calculation ($\mu\text{g}$)<br>• WHO 24h exposure budget progress bar ($225\,\mu\text{g}/\text{day}$ limit)<br>• Cigarette smoke equivalent calculation ($\approx 22\,\mu\text{g}/\text{m}^3 \approx 1$ cig)<br>• Clean-air outdoor activity windows | **Deterministic Model + On-Device User Inputs** |
| **07** | `/planner` | **Clean-Air Daily Routine** | • 24-hour hour-by-hour scheduled routine<br>• Activity-specific exposure mitigation recommendations<br>• Ventilation safe windows vs. sealing recommendations<br>• Gemini 2.5 Flash grounded routine generator<br>• Structured Fact Audit Viewer with numbered Fact IDs<br>• Deterministic offline fallback engine | **AI Planning + Deterministic Fact Verification** |
| **08** | `/indoor` | **Pillar 4: Home** | • Interactive 3D Room cutaway with window infiltration and purifier plume<br>• Single-zone mass-balance ODE solver ($dC_{in}/dt$)<br>• Real-time Ventilate-vs-Seal decision engine ($\Delta C_{in} < 0$)<br>• Purifier CADR sizing calculator ($\text{m}^3/\text{h}$ and room volume $V$)<br>• Corsi-Rosenthal DIY box fan builder specifications with MERV-13 | **Physical ODE Model** (Mathematical Simulation) |
| **09** | `/what-if` | **Pillar 5: Act** | • Interactive Commute Shift: Petrol two-wheeler vs. Electric Metro vs. Bus<br>• Household Cooking Fuel: Biomass Chulha vs. LPG vs. Electric Induction<br>• Air Purifier Operation: Continuous vs. Peak Intermittent<br>• Auditable Impact Receipts (Baseline, Alternative, Delta, Assumptions, Engine Version) | **Deterministic Comparative Engine** |
| **10** | `/drone` | **AeroSense Drone Lab** | • Aerial UAV telemetry flight deck HUD<br>• Vertical altitude profiling (0 to 120 meters AGL)<br>• Particulate count vs. altitude curve<br>• MQ-135 semiconductor raw sensor trend gauge<br>• Hardware status: `"Not Connected"` (Honest physical prototype status)<br>• Interactive Simulated Flight Demo with amber `SIMULATED` badge | **Prototype Hardware HUD + Simulated Demo** |
| **11** | `/community` | **Community Hub** | • Clean-Air Decision Score calculator (0–100 score of household actions)<br>• Sectoral Community Advisories (Schools, Elderly Care, Construction Sites)<br>• Neighborhood exposure heat indicators<br>• Action checklist for local residential associations | **Deterministic Action Scoring** (Zero clinical claims) |
| **12** | `/copilot` | **AI Copilot** | • Interactive natural language chat interface<br>• Prompt injection sanitizer & demographic privacy filter<br>• Fact-grounded Gemini 2.5 Flash query engine<br>• Fact citations referencing deterministic engine payload<br>• Anti-hallucination validator with automatic deterministic fallback | **Grounded GenAI + Strict Fact Enforcement** |

---

## 2. API Endpoints & Server-Side Handlers

| Endpoint | Method | Input Parameters | Output Payload | Source / Engine |
| :--- | :---: | :--- | :--- | :--- |
| `/api/snapshot` | `GET` | `lat`, `lon` | Fused criteria pollutants, CPCB AQI, inversion risk, atmospheric telemetry, incident view | Open-Meteo, CPCB NAQI Engine, Inversion Engine, Incident Engine |
| `/api/forecast` | `GET` | `lat`, `lon` | 96-hour hourly weather & air quality, inversion risk forecast, backtest calibration | Open-Meteo CAMS, Forecasting Engine |
| `/api/stations` | `GET` | `lat`, `lon`, `radiusKm` | Ground monitoring stations list with distance, PM2.5, PM10, AQI | WAQI API / CPCB Station Feed (or empty with transparent status) |
| `/api/fires` | `GET` | `lat`, `lon`, `radiusKm` | NASA FIRMS VIIRS satellite thermal anomaly detections (FRP, coordinates, confidence) | NASA FIRMS NRT API |
| `/api/drone/ingest` | `POST` / `GET` | `droneId`, `altitude_m`, `lat`, `lon`, `sensors` (POST) or `?demo=true` (GET) | Zod-validated hardware packet acknowledgement or simulated flight telemetry | Drone Telemetry Service |
| `/api/plan` | `POST` | `city`, `profiles`, `indoor`, `commute` | Fact-grounded 24h clean-air routine with verified fact citations | Gemini 2.5 Flash + Fact Validator + Fallback Planner |

---

## 3. Global Controls & Accessibility Features

- **Sidebar Navigation**: Desktop collapsible and mobile slide-out drawer with direct links to all 12 feature areas.
- **Location Selector**: Header dropdown with 5 pre-configured metropolitan centers (Bengaluru, Delhi-NCR, Mumbai, Kolkata, Chennai) and manual GPS coordinates input.
- **Multilingual Switcher**: Dropdown supporting 11 Indian scripts (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Urdu) with instant bidirectional RTL layout mirroring for Urdu.
- **Telemetry Freshness Strip**: Shows data provider latency, timestamp, and confidence indicator on every page.
- **Accessibility & Performance**: Dark environmental intelligence theme, high contrast WCAG ratios, `prefers-reduced-motion` compliance, and Three.js canvas fallbacks for low-power devices.
