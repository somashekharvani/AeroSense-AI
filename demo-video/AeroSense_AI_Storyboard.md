# AeroSense AI — Product Demonstration Video Storyboard (Updated)

> **Target Duration**: 11 Minutes 15 Seconds (within 8–12 minute target)  
> **Resolution**: 1920 × 1080 (Full HD, 30 FPS, 16:9)  
> **Aesthetic Theme**: Deep Emerald, Cyan, Slate Dark Mode (`#070c14`)  
> **Demonstration Narrative**: Continuous Bengaluru Sharma Family Use Case ($12.97^\circ\text{N}, 77.59^\circ\text{E}$) with Delhi-NCR comparative baseline  

---

## 1. Complete 15-Scene Timeline & Route Reconciliation

Every single one of the 12 actual website routes is accounted for with dedicated video recordings:

| Scene # | Scene Title | Exact Route | Duration | Time Window | Primary Focus & Interactive Controls |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **01** | **Opening & Project Vision** | Intro Graphics | 0:50 | `0:00 – 0:50` | Brand logo, problem statement, PromptWars Challenge 6 tagline |
| **02** | **Continuous Bengaluru Family Example** | Scenario Graphics | 0:45 | `0:50 – 1:35` | The Sharma Family: Aarav (child), Priya (adult), Grandfather (asthmatic) |
| **03** | **Landing Page & Navigation** | `/` | 0:35 | `1:35 – 2:10` | Hero banner, live quick preview, 5 pillar cards, CTA button click |
| **04** | **Overview Dashboard** | `/overview` | 0:50 | `2:10 – 3:00` | 3D Atmospheric Inversion Scene, CPCB NAQI Hero KPI, telemetry strip |
| **05** | **Live Air Intelligence** | `/live` | 0:50 | `3:00 – 3:50` | City Dropdown (Bengaluru ↔ Delhi), 6 criteria pollutants, CPCB sub-index table |
| **06** | **Forecast & Atmospheric Risk** | `/forecast` | 0:55 | `3:50 – 4:45` | 48-Hour forward curve, nocturnal inversion compression, backtest panel |
| **07** | **Family Protection & Inhaled Dose** | `/family` | 0:50 | `4:45 – 5:35` | On-device IndexedDB profiles, inhaled $\mu\text{g}$ dose, WHO budget, privacy |
| **08** | **Indoor Air Advisor** | `/indoor` | 0:45 | `5:35 – 6:20` | 3D Room Cutaway, mass-balance ODE, dynamic Ventilate-or-Seal decision |
| **09** | **What-If Simulator** | `/what-if` | 0:45 | `6:20 – 7:05` | Commute shift slider (scooter to metro), cooking fuel, expandable Impact Receipt |
| **10** | **AeroSense Drone Lab** | `/drone` | 0:40 | `7:05 – 7:45` | NOT CONNECTED status, Launch Simulated Demo, SIMULATED badge, vertical HUD |
| **11** | **Community Intelligence** | `/community` | 0:40 | `7:45 – 8:25` | Clean-Air Decision Score (0–100 actions only), Sectoral Advisories |
| **12** | **AI Copilot with Fact Citation** | `/copilot` | 0:40 | `8:25 – 9:05` | Natural language chat, prompt sanitizer, verified Fact ID citations |
| **13** | **Clean-Air Daily Planner** | `/planner` | 0:40 | `9:05 – 9:45` | 24-Hour personalized family routine, ventilation windows, commute advice |
| **14** | **Pollution Map & Spatial Radar** | `/map` | 0:35 | `9:45 – 10:20` | 10/25/50km rings, wind transport vector, NASA FIRMS hotspots, downwind arc |
| **15** | **Architecture, Impact & Conclusion** | System Diagram | 0:55 | `10:20 – 11:15` | 5-Layer Architecture (`architecture.svg`), 120 tests passed, PromptWars wrap-up |

---

## 2. Detailed Scene Specifications

### SCENE 1 — Opening and Project Introduction
- **Time**: `0:00 – 0:50` (50s)
- **Visual**: Cinematic urban morning fog transitioning into `public/images/logo.svg`.
- **Narration**: The urban air pollution crisis; why traditional colored dials fail families; introducing AeroSense AI and the 4-part tagline.
- **On-Screen**: *AeroSense AI | Clean-Air Decision Engine | PromptWars Challenge 6*.

### SCENE 2 — Continuous Bengaluru Family Example
- **Time**: `0:50 – 1:35` (45s)
- **Visual**: Morning in Bengaluru ($12.97^\circ\text{N}, 77.59^\circ\text{E}$). Introduce the Sharma family:
  - *Aarav (8 yrs, active child preparing for morning sports)*
  - *Priya (36 yrs, preparing to commute to Outer Ring Road)*
  - *Grandfather (68 yrs, senior with mild asthma planning a walk)*
- **Narration**: Establish the daily questions that AeroSense AI will answer across the 12 sections.

### SCENE 3 — Landing Page (`/`)
- **Time**: `1:35 – 2:10` (35s)
- **Visual**: Live website homepage. Cursor smoothly scrolls through the problem statement, live snapshot preview, and 5 pillar feature cards. Clicks **"Launch Dashboard"**.

### SCENE 4 — Overview Dashboard (`/overview`)
- **Time**: `2:10 – 3:00` (50s)
- **Visual**: Bengaluru CPCB NAQI = 139 (Moderate), Dominant: Ozone ($O_3$) at $127\,\mu\text{g}/\text{m}^3$. PM2.5 is low ($24.2\,\mu\text{g}/\text{m}^3$). 3D atmospheric column showing boundary layer at $1045\,\text{m}$. Freshness strip shows Open-Meteo online, CPCB engine active, Drone "Not Connected".

### SCENE 5 — Live Air Intelligence (`/live`)
- **Time**: `3:00 – 3:50` (50s)
- **Visual**: Full CPCB sub-index breakdown table for all 6 criteria pollutants. Cursor selects City Dropdown, switches to Delhi-NCR (AQI jumps to 255 Poor, PM2.5 surges to $106.9\,\mu\text{g}/\text{m}^3$), then switches back to Bengaluru.

### SCENE 6 — Forecast & Atmospheric Risk (`/forecast`)
- **Time**: `3:50 – 4:45` (55s)
- **Visual**: 48-Hour forward hourly curve. Explains vertical temperature lapse rate ($\Gamma = -\Delta T/\Delta z$) between surface, 925 hPa, and 850 hPa. Shows Backtest Calibration Panel with actual MAE, RMSE, and bias against observations.

### SCENE 7 — Family Protection & Inhaled Dose (`/family`)
- **Time**: `4:45 – 5:35` (50s)
- **Visual**: On-device profiles stored in IndexedDB. Inhaled dose calculations for Aarav ($13.3\,\mu\text{g}$), Priya, and Grandfather. WHO daily budget progress bar ($225\,\mu\text{g}/\text{day}$). Clear privacy explanation: personal profiles stay in IndexedDB; names are redacted before any Gemini API call.

### SCENE 8 — Indoor Air Advisor (`/indoor`)
- **Time**: `5:35 – 6:20` (45s)
- **Visual**: Interactive 3D room cutaway. Single-zone mass-balance ODE solver ($dC_{in}/dt$). Ventilate-or-Seal Decision Engine displays green **"Open Windows"** for Bengaluru ($C_{out} = 24.2\,\mu\text{g}/\text{m}^3$); CADR room sizing calculator; DIY Corsi-Rosenthal box fan specs.

### SCENE 9 — What-If Simulator (`/what-if`)
- **Time**: `6:20 – 7:05` (45s)
- **Visual**: Commute shift slider: shifting Priya's 15km trip from petrol scooter to Namma Metro rail reduces personal particulate emissions by **$-97.5\%$**. Cursor clicks **"View Impact Receipt"** to reveal auditable baseline, delta, and engine version (`impact@1.0.0`).

### SCENE 10 — AeroSense Drone Lab (`/drone`)
- **Time**: `7:05 – 7:45` (40s)
- **Visual**: UAV telemetry flight deck HUD. Connection status clearly shows **"Not Connected"**. Cursor clicks **"Launch Simulated Demo"**; amber **`SIMULATED`** badge illuminates. Vertical ascent graph to 120m. Hardware specs card explains Arduino + ESP8266 + MQ-135 prototype vs. roadmap sensors.

### SCENE 11 — Community Intelligence (`/community`)
- **Time**: `7:45 – 8:25` (40s)
- **Visual**: Clean-Air Decision Score calculator (84/100 measuring household actions, zero clinical claims). Sectoral advisories for schools, seniors, and construction sites.

### SCENE 12 — AI Copilot with Fact Citation (`/copilot`)
- **Time**: `8:25 – 9:05` (40s)
- **Visual**: User asks: *"Is it safe for Aarav to play outdoor soccer this afternoon in Bengaluru?"* Gemini 2.5 Flash responds citing verified Fact #1 (AQI 139 Moderate) and Fact #3 (PM2.5 $24.2\,\mu\text{g}/\text{m}^3$, boundary layer $1045\,\text{m}$). Highlight Fact Audit Viewer.

### SCENE 13 — Clean-Air Daily Planner (`/planner`)
- **Time**: `9:05 – 9:45` (40s)
- **Visual**: 24-Hour clean-air schedule for the Sharma family: 7:00 AM ventilation window, 8:30 AM metro transit advisory, 1:00 PM outdoor sports window, 7:00 PM evening seal advisory.

### SCENE 14 — Pollution Map & Spatial Radar (`/map`)
- **Time**: `9:45 – 10:20` (35s)
- **Visual**: Spatial radar map with 10km, 25km, and 50km concentric rings around Bengaluru. Cursor clicks the filter pills (**All**, **Stations**, **Fires**). Displays wind transport vector ($11.8\,\text{km}/\text{h}$ at $46^\circ$ NE) and downwind dispersion arc ($226^\circ$ SW, labeled ESTIMATE). Explains NASA FIRMS satellite thermal points are indicators, not ground-confirmed incidents.

### SCENE 15 — Technology, Architecture & Conclusion
- **Time**: `10:20 – 11:15` (55s)
- **Visual**: Full 5-Layer System Architecture (`public/architecture/architecture.svg`). Highlights 8 deterministic engines, 120 passing Vitest tests, Next.js 15, React 19, and 11-language support. Inspiring closing montage and credits to Somashekhar Vani for PromptWars Challenge 6.
