const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const audioDir = path.resolve('demo-video', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const scenes = [
  {
    id: 'scene_01',
    title: 'Opening & Project Vision',
    text: "Air pollution is one of the most critical public health emergencies of our time. Across South Asia and the Indo-Gangetic Plain, hundreds of millions of people wake up every morning under thick winter smog. But for most families, simply glancing at a single colored air quality number on their phone does not solve the problem. Knowing that the air is unhealthy does not tell a mother when it is safe to open the bedroom windows. It does not tell an asthmatic grandfather how much toxic particulate mass he will inhale during an evening walk. And it does not prove whether taking the electric metro instead of a scooter actually made an impact. Welcome to AeroSense AI, the Clean-Air Decision Engine. Built for PromptWars Challenge 6, AeroSense AI is an intelligent environmental platform that transforms raw atmospheric data into understandable insights, physical inversion forecasts, on-device family protection budgets, and auditable clean-air choices. Our mission is simple: Know the air. Predict the risk. Protect your family. Prove the impact."
  },
  {
    id: 'scene_02',
    title: 'Continuous Bengaluru Family Example',
    text: "To see how AeroSense AI works in the real world, let us follow a continuous day in the life of a family living right here in Bengaluru. Meet the Sharma family. The parents are getting ready to commute to their offices on the Outer Ring Road. Their eight-year-old son, Aarav, is packing his school bag for afternoon sports practice. And Aarav's grandfather, who lives with mild asthma, is planning his daily walk. Before stepping out, the family has vital questions: Is outdoor air clean enough for Aarav to run outdoors? Which specific pollutant is peaking today? Is pollution expected to trap closer to the ground this evening? Should they ventilate the apartment now, or keep the windows sealed and turn on the air purifier? Traditional air apps just hand them a number. AeroSense AI guides their decisions from sunrise to bedtime."
  },
  {
    id: 'scene_03',
    title: 'Landing Page & Navigation',
    text: "Here is the AeroSense AI platform, live on the web. From the very first glance, you notice our clean, dark environmental intelligence visual identity: deep ink slate accented by emerald and cyan, designed for high contrast and accessibility. Right on the homepage, visitors are greeted with our core philosophy: our own deterministic physical and mathematical engines do all the science. Generative AI only plans and explains. Every single quantified metric you see is grounded in verified physics, with zero hallucinated numbers. Notice the live snapshot widget giving an immediate preview of the current city, followed by quick introductions to the Five Pillars: Know, Predict, Protect, Home, and Act. Let us enter the platform by clicking Launch Dashboard."
  },
  {
    id: 'scene_04',
    title: 'Overview Dashboard',
    text: "We are now inside the Overview Dashboard. Notice the primary KPI card. Right now, in Bengaluru, our deterministic engine calculates an Indian National AQI of 139, placing the air in the Moderate category. But look closer: AeroSense AI does not just display 139. It reveals that the dominant pollutant driving this index today is Ozone at 127 micrograms per cubic meter, whereas fine particulate matter, PM2.5, is actually quite clean at 24.2 micrograms per cubic meter, well within the CPCB Good sub-index limit of 40. Right beside this, our interactive 3D Atmospheric Inversion Scene visualizes the vertical column of air above the city. Notice the deep convective boundary-layer height of 1045 meters. Because the boundary layer is high and vertical winds are blowing at 11.8 kilometers per hour, our Inversion Risk Score is low, just 24 out of 100. The atmosphere is actively venting pollutants upward. Down at the bottom, our Telemetry Freshness Strip displays the exact data providers used: Open-Meteo European reanalysis is online, the CPCB NAQI calculation engine is active, while ground station feeds and drone hardware transparently report their actual connection status."
  },
  {
    id: 'scene_05',
    title: 'Live Air Intelligence',
    text: "Moving to Pillar 1: Live Air Intelligence. Here, users can inspect every criteria pollutant monitored under Indian standards: PM2.5, PM10, Nitrogen Dioxide, Sulfur Dioxide, Carbon Monoxide, and Ozone. Every sub-index shown in this table is computed strictly according to the Central Pollution Control Board October 2014 guidelines. We show the exact concentration, the unit, and the mathematical sub-index. Now, let us demonstrate our multi-city spatial intelligence. If we switch our location from Bengaluru to Delhi-NCR in the top dropdown, watch how the entire dashboard dynamically updates. In Delhi right now, the CPCB AQI surges to 255, classified as Poor. Unlike Bengaluru, Delhi's air is heavily dominated by particulate matter, with PM2.5 reaching 106.9 micrograms per cubic meter, more than four times higher than Bengaluru. Let us switch back to Bengaluru to continue our family walk-through."
  },
  {
    id: 'scene_06',
    title: 'Forecast & Atmospheric Risk',
    text: "Next, let us explore Pillar 2: Pollution Forecast and Atmospheric Risk. Air quality changes dramatically between day and night. During cold winter evenings, the ground cools rapidly, creating a thermal inversion. Cold air is trapped beneath a warmer ceiling of air, compressing particulate pollution into a suffocating blanket. AeroSense AI's forecasting engine plots a forward 48-hour hourly outlook. By analyzing vertical temperature gradients between the surface, 925 hPa, and 850 hPa pressure levels, our physical lapse rate engine detects inversion traps hours before they compress ground-level air. For our Bengaluru family, the forecast shows that particulate concentrations remain stable throughout the afternoon, with a slight nocturnal dip in the planetary boundary layer around midnight. Notice our Backtest Calibration Panel. We believe in scientific honesty: we display the Mean Absolute Error, Root Mean Square Error, and systemic bias of our models against historical station observations. We never claim a model is 100% accurate; we show its actual uncertainty."
  },
  {
    id: 'scene_07',
    title: 'Family Protection & Inhaled Dose',
    text: "Now let us open Pillar 3: Family Protection. This is where environmental science becomes personal. First, notice our privacy architecture: all family profiles, ages, and medical sensitivities are stored strictly on the user's local browser in IndexedDB. When our AI Planner generates personalized advice, personal names and identifiers are stripped on the server, passing only anonymized age groups and sensitivities to Gemini. Here we have the Sharma family profiles: Aarav, age eight, an active child. Priya, age 36, an adult with moderate walking activity. And Grandfather, age 68, an asthmatic senior. AeroSense AI applies the physiological formula for inhaled particulate mass: Dose equals the sum of concentration multiplied by minute ventilation rate and duration. Because an active child inhales more air relative to body weight, Aarav's inhaled dose during an outdoor soccer game is calculated at 13.3 micrograms, consuming only 6% of his WHO daily recommended limit of 225 micrograms. For Grandfather, who has respiratory sensitivities, the platform highlights that afternoon conditions in Bengaluru are safe, with a cigarette smoke equivalent of less than 0.1 cigarettes."
  },
  {
    id: 'scene_08',
    title: 'Indoor Air Advisor',
    text: "Now we enter Pillar 4: Indoor Air Advisor. Most people spend 90% of their lives indoors, yet conventional apps assume indoor air is identical to the nearest highway monitor. AeroSense AI solves this using a first-principles PM2.5 Mass-Balance Differential Equation. We model outdoor infiltration through the building envelope, natural gravitational settling on floors and walls, internal emission sources like cooking, and mechanical filtration. Notice our interactive 3D room model. Right now, in Bengaluru, because outdoor PM2.5 is just 24.2 micrograms per cubic meter, our Ventilate-or-Seal Decision Engine displays a clear green recommendation: Open Windows for Natural Ventilation. Natural air exchange will dilute indoor carbon dioxide without polluting the room. But if we were in Delhi, where outdoor PM2.5 is 106.9 micrograms per cubic meter, the equation immediately reverses, instructing the user to Seal Windows and Run Purifier. The page also provides a purifier CADR sizing calculator for their 45 cubic meter bedroom, and complete open-source construction blueprints for a DIY Corsi-Rosenthal Box using MERV-13 filters."
  },
  {
    id: 'scene_09',
    title: 'What-If Simulator',
    text: "This brings us to Pillar 5: Act, The What-If Simulator. Sustainable choices only happen when people can clearly prove the impact of their decisions. Here, users can simulate everyday environmental trade-offs. Let us look at Priya's daily commute: If she shifts her 15-kilometer daily roundtrip from a petrol two-wheeler to the electric Namma Metro, look at the result. Her personal emission footprint drops by 97.5%, saving over 1.1 grams of fine toxic particulates from entering the city's air every single day. When we click View Impact Receipt, AeroSense AI generates an auditable scientific receipt. It shows the exact baseline used, the alternative scenario, the mathematical delta with units, the underlying physical emission factors, the confidence level, and the deterministic engine version impact at 1.0.0. Zero invented savings. Every number is traceable."
  },
  {
    id: 'scene_10',
    title: 'AeroSense Drone Lab',
    text: "Next, we visit the AeroSense Drone Lab, our custom hardware initiative for vertical atmospheric profiling. Ground monitors only measure air at two meters height. A low-altitude drone can map how pollution concentrates vertically across the first 100 meters of the boundary layer. Here, we practice radical engineering honesty. Notice the connection status banner: Not Connected. Our physical prototype, consisting of an Arduino, ESP8266 Wi-Fi module, MQ-135 gas sensor, and DHT22 temperature sensor, is currently in the workshop, so we never fake a live hardware connection. When we click Launch Flight Demonstration, an explicit amber badge illuminates: SIMULATED. The telemetry HUD animates a realistic quadcopter ascent up to 120 meters, illustrating how future PMS5003 laser counters and LiDAR altimeters will profile vertical pollution traps."
  },
  {
    id: 'scene_11',
    title: 'Community Intelligence',
    text: "In the Community Hub, individual actions scale to neighborhood impact. Our Clean-Air Decision Score calculates a score from 0 to 100 based strictly on verified household mitigation choices, such as commuting by transit, sealing windows during inversions, and operating purifiers efficiently. Crucially, this score measures actions, never biological health or medical status. The page also provides specialized Sectoral Action Plans: Practical guidelines for school principals on scheduling morning physical education; Safe clean-air sanctuary protocols for eldercare homes; And dust-suppression checklists for construction site managers."
  },
  {
    id: 'scene_12',
    title: 'AI Copilot with Fact Citation',
    text: "Now, let us interact with the AeroSense AI Copilot. Powered by Google Gemini 2.5 Flash, the Copilot answers natural language questions. But here is the critical difference: Before Gemini receives a prompt, our system sanitizes all user input against prompt injection and strips any personal demographic data. More importantly, Gemini is provided with a strict, pre-computed JSON payload of verified deterministic facts. Watch as we ask: What is the air quality in Bengaluru today, and can Aarav play outdoor soccer this afternoon? Look at the response: Gemini does not guess or hallucinate. It explicitly cites Fact Number 1: CPCB AQI is 139 Moderate, and Fact Number 3: PM2.5 is low at 24.2 micrograms per cubic meter with an open boundary layer of 1045 meters. It explains in plain English that outdoor play is safe, but advises against high-traffic roads during peak hours. Our server-side validator audits every number in the LLM output. If an unsupported number appears, it is rejected automatically."
  },
  {
    id: 'scene_13',
    title: 'Clean-Air Daily Planner',
    text: "In the Clean-Air Daily Planner, all of this intelligence is synthesized into a personalized 24-hour routine for the Sharma family. The planner schedules: A 7:00 AM brief ventilation window; An 8:30 AM recommendation to use the Namma Metro for commuting; An afternoon outdoor window between 1:00 PM and 4:00 PM when atmospheric convective mixing is strongest; And a 7:00 PM evening seal advisory to close windows before nocturnal cooling sets in. Every recommendation is accompanied by an action badge, an estimated exposure reduction, and a direct link to the underlying scientific fact."
  },
  {
    id: 'scene_14',
    title: 'Pollution Map & Spatial Radar',
    text: "Next, we open the Spatial Air and Incident Map at forward slash map. Here, users can inspect regional pollution vectors surrounding Bengaluru across 10, 25, and 50-kilometer concentric radar rings. Using the filter pills at the top, users can toggle between monitoring stations and NASA FIRMS active fire hotspots. Notice the wind transport indicator: winds are currently moving at 11.8 kilometers per hour from the Northeast towards 226 degrees Southwest. Our incident engine calculates the downwind dispersion arc across a 35-degree plume sector. In accordance with our scientific transparency rules, all satellite fire points are identified as radiometric thermal observations, and downwind dispersion zones are explicitly labeled as mathematical estimates."
  },
  {
    id: 'scene_15',
    title: 'Technology, Architecture & Conclusion',
    text: "Let us take a look under the hood at the System Architecture that powers AeroSense AI. Built on a decoupled 5-layer architecture: Layer 1: Multi-Source Ingestion brings together Open-Meteo weather and CAMS reanalysis, WAQI ground station feeds, NASA FIRMS satellite fire points, and our drone REST API. Layer 2: The Fusion, Privacy, and Safety Gateway calculates cross-source confidence scores, isolates family data in client-side IndexedDB, and shields against prompt injections. Layer 3: Deterministic Scientific Engines contains eight pure TypeScript engines, including the CPCB NAQI engine, inversion physics, indoor mass-balance ODE, and inhaled exposure budgets. They run 100% offline with zero LLM dependencies. Layer 4: The Fact Registry and Audit Validator generates auditable Impact Receipts and strictly validates all AI outputs. Layer 5: Presentation and Decision Intelligence combines Next.js 15, React 19, Three.js 3D visualizations, MapLibre GL radar, and full multilingual support across 11 Indian scripts, including complete bidirectional right-to-left mirroring for Urdu. The entire codebase is verified with 120 passing automated tests in Vitest. Developed by Somashekhar Vani for PromptWars Challenge 6. The platform is completely open-source and live right now at aero-sense-ai-psi.vercel.app. AeroSense AI: Know the air. Predict the risk. Protect your family. Prove the impact. Thank you."
  }
];

console.log('Generating audio for', scenes.length, 'scenes...');

for (const scene of scenes) {
  const wavPath = path.join(audioDir, `${scene.id}.wav`);
  const safeText = scene.text.replace(/"/g, '""');
  const psCommand = `
Add-Type -AssemblyName System.Speech;
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$synth.Rate = 4;
$synth.Volume = 100;
$synth.SetOutputToWaveFile("${wavPath.replace(/\\/g, '\\\\')}");
$synth.Speak("${safeText}");
$synth.Dispose();
`;
  fs.writeFileSync('temp_tts.ps1', psCommand, 'utf8');
  execSync('powershell -ExecutionPolicy Bypass -File temp_tts.ps1');
  if (fs.existsSync('temp_tts.ps1')) fs.unlinkSync('temp_tts.ps1');
  
  const stats = fs.statSync(wavPath);
  console.log(`Generated ${scene.id}.wav (${scene.title}) — ${stats.size} bytes`);
}

console.log('All 15 scene audio tracks generated successfully in demo-video/audio/');
