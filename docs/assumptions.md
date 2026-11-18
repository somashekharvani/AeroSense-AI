# AeroSense AI — Scientific Assumptions Registry

In compliance with `AGENTS.md`, every empirical parameter, breathing rate, emission factor, penetration ratio, and deposition coefficient used across the scientific engines is cataloged below with its current status (`verified` or `assumption, verify`).

---

## 1. Human Inhalation Ventilation Rates

| Parameter | Value | Unit | Source Citation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Child (1-11y) Rest** | `0.3` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Child (1-11y) Light** | `0.8` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Child (1-11y) Moderate** | `1.2` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Adult Rest** | `0.5` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Adult Light** | `1.2` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Adult Moderate** | `2.0` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Elderly (>65y) Rest** | `0.4` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Elderly (>65y) Light** | `1.0` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Elderly (>65y) Moderate**| `1.6` | $\text{m}^3/\text{h}$ | US EPA Exposure Factors Handbook (2011, Table 6-1) | `assumption, verify` |
| **Asthma/COPD Multiplier** | `1.1` | ratio | Elevated minute ventilation in obstructive respiratory conditions | `assumption, verify` |

---

## 2. Microenvironment Penetration & Transit Ratios

| Microenvironment | Value | Unit | Basis / Citation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Scooter / 2-Wheeler** | `1.00` | ratio | Direct ambient roadway exhaust envelope | `assumption, verify` |
| **Metro Rail Carriage** | `0.22` | ratio | DMRC HVAC air recirculation and MERV carriage filtration | `assumption, verify` |
| **Public City Bus** | `0.65` | ratio | Non-AC/standard transit bus with frequent door stops | `assumption, verify` |
| **Private Car (Closed AC)**| `0.35` | ratio | Standard automotive cabin filter in recirculation mode | `assumption, verify` |

---

## 3. Vehicular Tailpipe Carbon Emissions

| Vehicle Category | Emission Factor | Unit | Source Registry | Status |
| :--- | :--- | :--- | :--- | :--- |
| **110cc Petrol Scooter** | `38.0` | $\text{g CO}_2/\text{km}$ | ARAI / CPCB Indian vehicular emissions inventory | `assumption, verify` |
| **Petrol Passenger Car** | `142.0` | $\text{g CO}_2/\text{km}$ | Bureau of Energy Efficiency (BEE) India average car | `assumption, verify` |
| **Metro Rail Transit** | `11.5` | $\text{g CO}_2/\text{p-km}$ | Delhi Metro Clean Development Mechanism (UNFCCC report) | `assumption, verify` |
| **City Transit Bus (CNG)**| `28.0` | $\text{g CO}_2/\text{p-km}$ | CPCB urban public bus fleet inventory (60% loading) | `assumption, verify` |

---

## 4. Indoor Air Building Physics

| Parameter | Value | Unit | Scientific Basis | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Infiltration $a$ (Sealed)** | `0.3` | $1/\text{h}$ | ASHRAE 62.2 / Weather-stripped Indian apartment | `assumption, verify` |
| **Infiltration $a$ (Normal)** | `0.8` | $1/\text{h}$ | Standard Indian masonry construction (closed windows) | `assumption, verify` |
| **Infiltration $a$ (Open)** | `3.5` | $1/\text{h}$ | Natural cross-ventilation measurements | `assumption, verify` |
| **Envelope Penetration $P$** | `0.8` | ratio | Long et al. (2001) EPA PM2.5 crack penetration factor | `assumption, verify` |
| **Deposition Loss Rate $k$** | `0.18` | $1/\text{h}$ | Thatcher & Layton (1995) indoor surface settling | `assumption, verify` |
| **Corsi-Rosenthal Box CADR** | `510.0` | $\text{m}^3/\text{h}$ | Corsi & Rosenthal (2020) 20-inch fan with 4x MERV-13 filters | `assumption, verify` |
| **LPG Cooking Emission $S$** | `3500.0` | $\mu\text{g/h}$ | Huboyo et al. (2014) domestic LPG burner rate | `assumption, verify` |
| **Biomass Chulha Emission $S$**| `45000.0`| $\mu\text{g/h}$ | Smith et al. (2000) Global Burden of Disease household solid fuel | `assumption, verify` |
| **Electric Induction Emission $S$**| `1200.0`| $\mu\text{g/h}$ | Oil vaporization aerosol without combustion exhaust | `assumption, verify` |

---

## 5. Inversion & Exposure Reference Guidelines

| Parameter | Value | Unit | Citation | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Inversion Threshold** | `0.0` | $^\circ\text{C}/100\text{m}$ | Standard meteorological definition ($\Delta T / \Delta z > 0$) | `verified` |
| **BLH Compression Trap** | `350.0` | $\text{m}$ | Guttikunda et al. (2014) Delhi winter boundary layer studies | `assumption, verify` |
| **Calm Wind Threshold** | `2.2` | $\text{m/s}$ | CPCB winter stagnant wind boundary ($< 8\text{ km/h}$) | `assumption, verify` |
| **WHO 24h $\text{PM}_{2.5}$ Target**| `15.0` | $\mu\text{g/m}^3$ | WHO Global Air Quality Guidelines (2021) | `verified` |
| **Cigarette Equivalence Rule** | `22.0` | $\mu\text{g/m}^3/\text{cig}$ | Berkeley Earth (Muller & Muller 2018) illustrative heuristic | `assumption, verify` |
