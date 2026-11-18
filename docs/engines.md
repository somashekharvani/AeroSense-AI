# AeroSense AI — Scientific Engines Documentation

This document explains the physical governing equations, atmospheric principles, empirical models, and deterministic code structures used across all seven scientific engines in AeroSense AI.

---

## 1. Indian CPCB National AQI Engine (`engines/indian-aqi.ts`)

### Official Reference
- **Central Pollution Control Board (CPCB)**, Ministry of Environment, Forest and Climate Change, Government of India: *"National Air Quality Index"* (NAQI), October 2014. [CPCB NAQI Report](http://www.cpcb.nic.in/upload/NAQI_FINAL_REPORT.pdf)

### Mathematical Formulation
For each criteria pollutant $p$, the sub-index $I_p$ is computed via linear interpolation across the standard CPCB breakpoint band $[B_{LO}, B_{HI}]$ corresponding to sub-index band $[I_{LO}, I_{HI}]$:

$$I_p = \left( \frac{I_{HI} - I_{LO}}{B_{HI} - B_{LO}} \right) \cdot (C_p - B_{LO}) + I_{LO}$$

The overall AQI is the maximum valid sub-index:
$$AQI = \max(I_1, I_2, \dots, I_n)$$
The dominant pollutant is the pollutant with $\max(I_p)$.

### CPCB Completeness & Category Rules
1. **Averaging Periods**:
   - 24-hour rolling average for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{NH}_3$, $\text{Pb}$ (Requires at least 16 valid hours out of 24).
   - 8-hour rolling average for $\text{CO}$ and $\text{O}_3$ (Requires at least 6 valid hours out of 8).
2. **Minimum Pollutant Constraint**:
   - CPCB requires at least 3 criteria pollutants to be actively monitored, with at least one being Particulate Matter ($\text{PM}_{2.5}$ or $\text{PM}_{10}$).
   - If this condition is not met, the engine returns the calculated estimate with `isPartial: true` and an explicit explanatory reason.

---

## 2. Inversion Risk Engine (`engines/inversion.ts`)

### Physical Principle
In a standard troposphere, temperature drops with altitude at approximately $-0.65^\circ\text{C} / 100\text{m}$. A thermal inversion occurs when warm air overlies cooler surface air:
$$\frac{dT}{dz} > 0$$
This acts as an atmospheric lid, suppressing vertical convection and trapping ground emissions within a shallow boundary layer.

### Formulation
Using actual geopotential heights above ground level ($z_{AGL} = Z_{pressure} - Z_{surface}$):
$$\Gamma_{925} = \left( \frac{T_{925} - T_{surface}}{Z_{925} - Z_{surface}} \right) \times 100 \quad (^\circ\text{C} / 100\text{m})$$

### 0-100 Risk Score Composition
- **Thermal Gradient Strength (45%)**: $\max(\Gamma_{925}, \Gamma_{850})$. A gradient $> +1.5^\circ\text{C}/100\text{m}$ indicates strong inversion.
- **Boundary Layer Height Compression (25%)**: Boundary layer height ($BLH$) $< 350\text{m}$ severely constrains mixing volume.
- **Calm Surface Winds (15%)**: Wind speed $< 8\text{ km/h}$ ($\approx 2.2\text{ m/s}$) inhibits mechanical shear dispersion.
- **Nocturnal Radiative Cooling (15%)**: Clear skies ($CC < 30\%$) between 20:00 and 08:00 maximize surface ground radiation loss.

> **Rule**: Inversion is reported strictly as a **probabilistic physical risk score**, never as a "confirmed fact".

---

## 3. Exposure Inhalation Dose Engine (`engines/exposure.ts`)

### Mathematical Formulation
The cumulative mass of $\text{PM}_{2.5}$ inhaled over daily activity segments is:

$$D = \sum_{i} \left[ C_i \times BR_i \times \frac{t_i}{60} \right]$$

where:
- $C_i$ = Microenvironment $\text{PM}_{2.5}$ concentration ($\mu\text{g/m}^3$)
- $BR_i$ = Inhalation breathing rate for age group and exertion level ($\text{m}^3/\text{h}$) from the US EPA Exposure Factors Handbook
- $t_i$ = Duration of activity segment (minutes)

### Daily Budget
Compared against the WHO 2021 24-hour guideline reference exposure ($15\text{ }\mu\text{g/m}^3 \times \text{daily ventilation volume}$).

---

## 4. Indoor Air Mass-Balance Engine (`engines/indoor-air.ts`)

### Governing Differential Equation
Under dynamic infiltration, indoor emissions, deposition, and mechanical filtration:

$$\frac{dC}{dt} = P \cdot a \cdot C_{out} + \frac{S}{V} - \left( a + k + \frac{CADR}{V} \right) C$$

where:
- $V$ = Room air volume ($\text{m}^3$)
- $C_{out}$ = Ambient outdoor $\text{PM}_{2.5}$ ($\mu\text{g/m}^3$)
- $a$ = Air exchange rate ($1/\text{h}$)
- $P$ = Particulate envelope penetration ratio ($0 \le P \le 1$)
- $k$ = Surface deposition loss coefficient ($1/\text{h}$)
- $S$ = Indoor particulate emission rate ($\mu\text{g/h}$)
- $CADR$ = Clean Air Delivery Rate ($\text{m}^3/\text{h}$)

### Steady State & Analytical Transient Solution
Setting $\lambda = a + k + \frac{CADR}{V}$:
$$C_{ss} = \frac{P \cdot a \cdot C_{out} + \frac{S}{V}}{\lambda}$$
$$C(t) = C_{ss} + (C_0 - C_{ss}) \cdot \exp(-\lambda \cdot t)$$

---

## 5. Impact Quantification Engine (`engines/impact.ts`)

The sole generator of savings claims within AeroSense AI. Produces auditable **Impact Receipts** for:
1. **Scooter vs Metro Transit**: Inhaled dose delta based on in-cabin filtration ratios ($P_{metro} = 0.22$ vs $P_{scooter} = 1.0$) and tailpipe $CO_2$ factor delta.
2. **Cooking Fuel**: Solid fuel biomass vs LPG/Induction source emission delta.
3. **Air Purifiers**: Steady-state equilibrium reduction and cumulative trapped particulate mass.

---

## 6. Clean-Air Decision Score (`engines/decision-score.ts`)

A 0-100 behavioral scoring index evaluating 4 measurable categories:
1. Exposure Avoidance (30 pts)
2. Indoor Air Actions (40 pts)
3. Sustainable Mobility (15 pts)
4. Personal Protection Equipment (15 pts)

> **Rule**: Measures calculated household actions only; never claims to measure clinical health.

---

## 7. Forecasting Evaluation Engine (`engines/forecasting.ts`)

Provides statistical error metrics between forecast series $\hat{Y}$ and observed telemetry $Y$:
- **MAE**: $\frac{1}{n} \sum |\hat{y}_i - y_i|$
- **RMSE**: $\sqrt{\frac{1}{n} \sum (\hat{y}_i - y_i)^2}$
- **Bias**: $\frac{1}{n} \sum (\hat{y}_i - y_i)$
- Applies deterministic atmospheric vertical column compression factors based on BLH and inversion scores. Does not claim to be an ML model.
