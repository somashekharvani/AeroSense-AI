/**
 * Scientific Assumptions & Parameter Registry
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Every assumption (breathing rates, emission factors, penetration, deposition)
 * lives in a config file with a source field and is marked 'assumption, verify'
 * until a real source is added."
 */

export interface AssumptionParam<T = number> {
  value: T;
  unit: string;
  source: string;
  status: 'assumption, verify' | 'verified';
  notes: string;
}

export const SCIENTIFIC_ASSUMPTIONS = {
  // Inhalation breathing rates by age group and exertion (m³/h)
  // US EPA Exposure Factors Handbook (2011 Edition, Chapter 6, Table 6-1)
  breathingRates: {
    child: {
      rest: {
        value: 0.3,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Child 1-11y)',
        status: 'assumption, verify',
        notes: 'Sleep and passive sitting',
      },
      light: {
        value: 0.8,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Child 1-11y)',
        status: 'assumption, verify',
        notes: 'Normal school/desk activity and walking',
      },
      moderate: {
        value: 1.2,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Child 1-11y)',
        status: 'assumption, verify',
        notes: 'Outdoor play, running, sports',
      },
    },
    adult: {
      rest: {
        value: 0.5,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults 21-55y)',
        status: 'assumption, verify',
        notes: 'Sleep and sedentary office work',
      },
      light: {
        value: 1.2,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults 21-55y)',
        status: 'assumption, verify',
        notes: 'Commuting, light walking, household chores',
      },
      moderate: {
        value: 2.0,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults 21-55y)',
        status: 'assumption, verify',
        notes: 'Bicycling, brisk walking, manual labor, jogging',
      },
    },
    elderly: {
      rest: {
        value: 0.4,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults >65y)',
        status: 'assumption, verify',
        notes: 'Sedentary resting',
      },
      light: {
        value: 1.0,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults >65y)',
        status: 'assumption, verify',
        notes: 'Light domestic activity and slow walking',
      },
      moderate: {
        value: 1.6,
        unit: 'm³/h',
        source: 'US EPA Exposure Factors Handbook (2011, Table 6-1, Adults >65y)',
        status: 'assumption, verify',
        notes: 'Brisk walking or climbing stairs',
      },
    },
  },

  // Microenvironment In-Cabin Particulate Penetration Ratios
  // Represents in-cabin PM2.5 / ambient PM2.5
  microenvironmentPenetration: {
    scooterTwoWheeler: {
      value: 1.0,
      unit: 'ratio',
      source: 'Direct ambient roadway exposure (Open helmet/face)',
      status: 'assumption, verify',
      notes: 'No barrier between rider respiratory zone and road exhaust',
    },
    metroCarriage: {
      value: 0.22,
      unit: 'ratio',
      source: 'Delhi Metro Rail Corporation HVAC filtration literature & ASHRAE 52.2 MERV',
      status: 'assumption, verify',
      notes: 'Air-conditioned underground & elevated carriages with recirculation filtration',
    },
    busPublicTransit: {
      value: 0.65,
      unit: 'ratio',
      source: 'Urban bus in-cabin air quality studies (standard non-AC or AC mixed)',
      status: 'assumption, verify',
      notes: 'Frequent door opening at stops increases roadway infiltration',
    },
    privateCarClosedAC: {
      value: 0.35,
      unit: 'ratio',
      source: 'Automotive cabin air filtration (standard OEM filter on recirculation mode)',
      status: 'assumption, verify',
      notes: 'Cabin filter with recirculating air conditioning',
    },
  },

  // Tailpipe CO2 emissions per passenger-km (g CO2 / passenger-km)
  transportEmissionFactors: {
    petrolTwoWheeler: {
      value: 38.0,
      unit: 'g CO2/km',
      source: 'ARAI / CPCB Indian vehicular emissions inventory for 110-125cc 4-stroke 2W',
      status: 'assumption, verify',
      notes: 'Single rider occupancy (~35-40 g CO2/km)',
    },
    petrolCar: {
      value: 142.0,
      unit: 'g CO2/km',
      source: 'Bureau of Energy Efficiency (BEE) India average petrol passenger car',
      status: 'assumption, verify',
      notes: 'Single occupant commute',
    },
    metroRail: {
      value: 11.5,
      unit: 'g CO2/passenger-km',
      source: 'Delhi Metro Clean Development Mechanism (CDM) UNFCCC verified report',
      status: 'assumption, verify',
      notes: 'Grid power carbon intensity divided by average passenger loading',
    },
    busTransit: {
      value: 28.0,
      unit: 'g CO2/passenger-km',
      source: 'CPCB urban public bus fleet average emission factor per passenger',
      status: 'assumption, verify',
      notes: 'CNG urban bus with 60% load factor',
    },
  },

  // Indoor Building Physics (Mass Balance)
  indoorPhysics: {
    airExchangeRate: {
      sealed: {
        value: 0.3,
        unit: '1/h',
        source: 'ASHRAE 62.2 / Indian apartment with weather-stripped windows shut',
        status: 'assumption, verify',
        notes: 'Infiltration rate through seams and closed sashes',
      },
      normal: {
        value: 0.8,
        unit: '1/h',
        source: 'Standard Indian residential dwelling with closed doors and windows',
        status: 'assumption, verify',
        notes: 'Typical infiltration rate',
      },
      windowsOpen: {
        value: 3.5,
        unit: '1/h',
        source: 'Cross-ventilation natural ventilation measurements',
        status: 'assumption, verify',
        notes: 'Windows open on opposite walls',
      },
    },
    penetrationFactorP: {
      value: 0.8,
      unit: 'ratio',
      source: 'Long et al. (2001) / EPA Indoor Air Quality penetration for PM2.5',
      status: 'assumption, verify',
      notes: 'Fraction of outdoor PM2.5 that passes through envelope cracks without deposition',
    },
    depositionRateK: {
      value: 0.18,
      unit: '1/h',
      source: 'Thatcher and Layton (1995) indoor aerosol surface deposition coefficient',
      status: 'assumption, verify',
      notes: 'Gravitational settling and Brownian diffusion of 0.1-2.5 µm particles onto floors/walls',
    },
    corsiRosenthalCadr: {
      value: 510.0,
      unit: 'm³/h',
      source: 'Corsi and Rosenthal (2020) DIY 4-filter MERV-13 box fan chamber test',
      status: 'assumption, verify',
      notes: '20-inch 3-speed box fan on medium speed with four 20x20x2 MERV-13 filters (~300 CFM)',
    },
    cookingEmissionRateS: {
      lpg: {
        value: 3500.0,
        unit: 'µg/h',
        source: 'Huboyo et al. (2014) indoor cooking emission rates for clean LPG burner',
        status: 'assumption, verify',
        notes: 'Standard stir-frying on LPG gas burner',
      },
      biomassSolidFuel: {
        value: 45000.0,
        unit: 'µg/h',
        source: 'Smith et al. (2000) Global Burden of Disease household solid fuel emission database',
        status: 'assumption, verify',
        notes: 'Unvented biomass or coal chulha cooking',
      },
      electricInduction: {
        value: 1200.0,
        unit: 'µg/h',
        source: 'Food vaporization particulate rate without combustion exhaust',
        status: 'assumption, verify',
        notes: 'Particulates from cooking oil without fuel combustion',
      },
    },
  },

  // Atmospheric Inversion Heuristic Model Weights (0-100 score)
  inversionWeights: {
    gradientThresholdPositive: {
      value: 0.0,
      unit: '°C / 100m',
      source: 'Standard meteorological definition of thermal inversion (dT/dz > 0)',
      status: 'assumption, verify',
      notes: 'Any temperature rise with altitude signals stable capping layer',
    },
    boundaryLayerHeightThreshold: {
      value: 350.0,
      unit: 'm',
      source: 'Guttikunda et al. (2014) Delhi winter boundary layer pollution trapping studies',
      status: 'assumption, verify',
      notes: 'BLH below 350m drastically compresses mixing volume',
    },
    calmWindSpeedThreshold: {
      value: 2.2,
      unit: 'm/s',
      source: 'CPCB winter meteorological guidelines for stagnant calm air (< 8 km/h)',
      status: 'assumption, verify',
      notes: 'Wind speeds below 2.2 m/s inhibit horizontal and mechanical dispersion',
    },
  },

  // Daily PM2.5 Inhalation Exposure Reference Budget
  exposureBudget: {
    whoDailyGuidelineConcentration: {
      value: 15.0,
      unit: 'µg/m³',
      source: 'WHO Global Air Quality Guidelines (2021) 24-hour PM2.5 interim target',
      status: 'verified',
      notes: 'Recommended 24h mean outdoor concentration',
    },
    baseAdultInhaledBudgetUg: {
      value: 216.0,
      unit: 'µg/day',
      source: 'Calculated: 15 µg/m³ × 14.4 m³/day adult normal breathing volume',
      status: 'assumption, verify',
      notes: 'Reference daily healthy dose baseline',
    },
    cigaretteEquivalentRatio: {
      value: 22.0,
      unit: 'µg/m³ per cigarette',
      source: 'Muller and Muller (2018) / Berkeley Earth PM2.5 to cigarette rule of thumb',
      status: 'assumption, verify',
      notes: 'Approximate equivalence rule: breathing 22 µg/m³ for 24h ≈ 1 cigarette inhaled mass',
    },
  },
} as const;
