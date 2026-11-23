# AeroSense AI — Demonstration Data Reference & Classification (Updated)

> **Purpose**: This document catalogs every numeric metric, environmental observation, and calculation displayed during the product demonstration video, along with its verified data source, exact recording timestamp, and formal scientific classification.

---

## 1. Primary Demonstration City: Bengaluru, Karnataka, India

- **Coordinates**: $12.97^\circ\text{N}, 77.59^\circ\text{E}$
- **Ground Elevation**: $914\,\text{m}$ Above Sea Level
- **Observation & Model Timestamp**: `2026-11-23T09:14:20Z` (Verified fresh via Open-Meteo & Copernicus CAMS Atmospheric Service)
- **Data Freshness**: Current live model run (< 1 hour)

### Real-Time Criteria Pollutants & Indian CPCB NAQI

| Pollutant | Observed Value | Measurement Unit | CPCB Breakpoint Sub-Index | Sub-Index Category | Data Classification | Source Reference |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Composite AQI** | **139** | — | **139** | **Moderate** | **Deterministic Calculation** | CPCB October 2014 Interpolation Engine (`indian-aqi.ts`) |
| **Dominant Pollutant**| **Ozone ($O_3$)**| $\mu\text{g}/\text{m}^3$ | 139 | Moderate | **Deterministic Selection** | Highest sub-index among criteria pollutants |
| **PM2.5** | 24.2 | $\mu\text{g}/\text{m}^3$ | 40 | Good | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |
| **PM10** | 25.3 | $\mu\text{g}/\text{m}^3$ | 25 | Good | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |
| **Nitrogen Dioxide ($NO_2$)** | 8.8 | $\mu\text{g}/\text{m}^3$ | 11 | Good | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |
| **Sulfur Dioxide ($SO_2$)** | 9.5 | $\mu\text{g}/\text{m}^3$ | 12 | Good | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |
| **Carbon Monoxide ($CO$)** | 0.41 | $\text{mg}/\text{m}^3$ | 21 | Good | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |
| **Ozone ($O_3$)** | 127.0 | $\mu\text{g}/\text{m}^3$ | 139 | Moderate | **Modeled Reanalysis** | Open-Meteo / Copernicus CAMS Atmospheric Service |

---

## 2. Atmospheric Profile & Inversion Risk Physics

| Parameter | Value | Unit | Physical Interpretation | Data Classification |
| :--- | :---: | :---: | :--- | :--- |
| **Surface Temperature** | 26.9 | $^\circ\text{C}$ | Ambient 2-meter air temperature | **Live Atmospheric Model** |
| **Relative Humidity** | 33 | $\%$ | Low-to-moderate humidity aiding air dispersion | **Live Atmospheric Model** |
| **Wind Speed (10m)** | 11.8 | $\text{km}/\text{h}$ | Gentle breeze promoting mechanical atmospheric mixing | **Live Atmospheric Model** |
| **Wind Direction** | 46 | $^\circ$ (NE) | Winds blowing from Northeast towards Southwest ($226^\circ$) | **Live Atmospheric Model** |
| **Planetary Boundary Layer (PBLH)** | 1045 | $\text{m}$ | Deep convective boundary layer aiding vertical pollutant venting | **Live Atmospheric Model** |
| **925 hPa Lapse Rate Gradient** | 0.00 | $^\circ\text{C}/100\text{m}$ | Neutral stability near surface | **Deterministic Engine Calculation** |
| **850 hPa Lapse Rate Gradient** | -1.24 | $^\circ\text{C}/100\text{m}$ | Standard adiabatic cooling with altitude (no upper lid) | **Deterministic Engine Calculation** |
| **Inversion Risk Score** | **24 / 100** | — | **Low Risk** (No dangerous thermal trap present during afternoon) | **Physical Risk Score (`inversion.ts`)** |

---

## 3. Secondary Comparative Reference: Delhi-NCR (Winter Smog Episode)

- **Coordinates**: $28.61^\circ\text{N}, 77.21^\circ\text{E}$
- **Timestamp**: `2026-11-23T09:14:31Z` (Fresh live query)

| Parameter | Delhi-NCR Value | Bengaluru Value | Comparison Insight | Classification |
| :--- | :---: | :---: | :--- | :--- |
| **Composite AQI** | **255 (Poor)** | **139 (Moderate)** | Delhi AQI is dominated by severe particulate matter | Verified Live Calculation |
| **PM2.5 Concentration** | **106.9 $\mu\text{g}/\text{m}^3$** | **24.2 $\mu\text{g}/\text{m}^3$** | Delhi PM2.5 is **4.4× higher** than Bengaluru | Modeled Reanalysis |
| **PM10 Concentration** | **107.6 $\mu\text{g}/\text{m}^3$** | **25.3 $\mu\text{g}/\text{m}^3$** | Coarse particulate accumulation in Indo-Gangetic basin | Modeled Reanalysis |
| **Boundary Layer Height** | **335 m** | **1045 m** | Delhi's boundary layer is compressed into a tight 335m lid | Meteorological Reanalysis |
| **Surface Wind Speed** | **5.8 km/h** | **11.8 km/h** | Stagnant winds in Delhi trap particulate emissions | Meteorological Reanalysis |

---

## 4. Hardware Telemetry & Sensor Honest Disclosure

| Component | Status Displayed | Technical Explanation | Honesty Commitment |
| :--- | :---: | :--- | :--- |
| **AeroSense Drone Connection** | `"Not Connected"` | The physical prototype ESP8266 transmitter is currently awaiting field link. Zero packets are fabricated. | **Strictly Honest Status** |
| **Flight Demonstration Mode** | `SIMULATED` | Interactive UAV demo generated via `/api/drone/ingest?demo=true` for demonstration purposes. | **Explicit Amber Badge** |
| **Drone Prototype Sensors** | Arduino Uno/Nano + ESP8266 Wemos D1 + MQ-135 + DHT22 | Measures relative air resistance and temperature/humidity. | **Prototype Hardware Verified** |
| **MQ-135 Sensor Reading** | *Relative Gas Trend Only* | Raw analog reading (0–1024). Not a calibrated AQI sensor. | **Never Feeds National AQI** |
| **Planned Hardware Sensors** | PMS5003 Laser Counter, Sensirion SPS30, TF-Mini LiDAR, GPS | Future roadmap items under active prototyping. | **Labeled Roadmap in Script** |

---

## 5. Mathematical Models & User Input Parameters

### A. Indoor Mass-Balance ODE (`indoor-air.ts`)
- **Room Volume ($V$)**: $45\,\text{m}^3$ (Typical Indian residential master bedroom: $4\,\text{m} \times 3.8\,\text{m} \times 3\,\text{m}$)
- **Building Penetration Factor ($P$)**: $0.60$ (Standard residential envelope with aluminum sliding windows)
- **Closed Window Air Exchange ($a_{\text{closed}}$)**: $0.4\,\text{ACH}$ ($\text{h}^{-1}$)
- **Open Window Air Exchange ($a_{\text{open}}$)**: $2.5\,\text{ACH}$ ($\text{h}^{-1}$)
- **Surface Deposition Rate ($k_{dep}$)**: $0.20\,\text{h}^{-1}$ (Standard gravitational settling coefficient for PM2.5)
- **Air Purifier Clean Air Delivery Rate (CADR)**: $280\,\text{m}^3/\text{h}$
- **Outdoor Baseline ($C_{out}$)**: $24.2\,\mu\text{g}/\text{m}^3$ (Bengaluru) / $106.9\,\mu\text{g}/\text{m}^3$ (Delhi)
- **Classification**: **First-Principles Physical ODE Simulation**

### B. Inhaled Particulate Dose Model (`exposure.ts`)
- **Adult Walking**: Minute ventilation rate $V_E = 1.20\,\text{m}^3/\text{h}$
- **Child Light Activity**: Minute ventilation rate $V_E = 0.55\,\text{m}^3/\text{h}$
- **Elderly Resting**: Minute ventilation rate $V_E = 0.45\,\text{m}^3/\text{h}$
- **WHO 24-Hour Guideline Reference Budget**: $15\,\mu\text{g}/\text{m}^3 \times 15\,\text{m}^3/\text{day} = 225\,\mu\text{g}/\text{day}$
- **Cigarette Smoke Equivalency Factor**: $22.0\,\mu\text{g}/\text{m}^3$ continuous 24h outdoor exposure $\approx 1$ cigarette
- **Privacy Architecture**: Stored locally on-device in IndexedDB (`idb-keyval`). Personal identifiers are redacted before any Gemini API call (`lib/privacy/redact.ts`).
- **Classification**: **Mathematical Exposure Budget Model (Not a medical diagnosis)**

### C. What-If Modal Shift Simulator (`impact.ts`)
- **Commuter Route**: $15\,\text{km}$ daily roundtrip
- **Petrol Two-Wheeler Emission Factor**: $0.080\,\text{g PM2.5}/\text{passenger-km}$
- **Electric Metro Rail Emission Factor**: $0.002\,\text{g PM2.5}/\text{passenger-km}$
- **Estimated Commute Emission Reduction**: $-97.5\%$ particulate emissions saved per trip
- **Classification**: **Deterministic Comparative Impact Receipt**
