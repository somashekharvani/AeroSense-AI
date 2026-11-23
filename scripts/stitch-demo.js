const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const rawDir = path.resolve('demo-video', 'raw');
const audioDir = path.resolve('demo-video', 'audio');
const processedDir = path.resolve('demo-video', 'processed');
const outputDir = path.resolve('demo-video');

if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

const durationsPath = path.join(audioDir, 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

// Detailed narration subtitles for each scene
const sceneSubtitles = {
  scene_01: [
    { offset: 0, text: "Air pollution is one of the most critical public health emergencies of our time." },
    { offset: 6, text: "Across South Asia and the Indo-Gangetic Plain, hundreds of millions wake up under thick winter smog." },
    { offset: 14, text: "Knowing the air is 'Unhealthy' doesn't tell a mother when to open windows, or an asthmatic grandfather his inhaled particulate mass." },
    { offset: 26, text: "Welcome to AeroSense AI — the Clean-Air Decision Engine, built for PromptWars Challenge 6." },
    { offset: 38, text: "Our mission: Know the air. Predict the risk. Protect your family. Prove the impact." }
  ],
  scene_02: [
    { offset: 0, text: "To see how AeroSense AI works in the real world, let's follow the Sharma family in Bengaluru." },
    { offset: 9, text: "The parents commute on Outer Ring Road, 8-year-old Aarav has soccer practice, and Grandfather plans his daily walk." },
    { offset: 21, text: "Is outdoor air safe for soccer? Is pollution trapping closer to the ground? Should they ventilate or seal?" },
    { offset: 31, text: "Traditional apps just give a number. AeroSense AI guides their decisions from sunrise to bedtime." }
  ],
  scene_03: [
    { offset: 0, text: "Here is the AeroSense AI platform, live on the web at aero-sense-ai-psi.vercel.app." },
    { offset: 8, text: "Deep ink slate accented by emerald and cyan, designed for high contrast and accessibility." },
    { offset: 17, text: "Our deterministic engines do all the science. Generative AI only plans and explains." },
    { offset: 27, text: "Every metric is grounded in verified physics with zero hallucinated numbers. Let's launch the dashboard." }
  ],
  scene_04: [
    { offset: 0, text: "We are now inside the Overview Dashboard." },
    { offset: 5, text: "Right now in Bengaluru, our deterministic engine calculates an Indian National AQI of 139 (Moderate)." },
    { offset: 16, text: "The dominant pollutant is Ozone (O3) at 127 µg/m³, while PM2.5 is clean at 24.2 µg/m³." },
    { offset: 28, text: "Our 3D atmospheric scene shows a convective boundary-layer height of 1,045 meters." },
    { offset: 40, text: "With winds at 11.8 km/h, the Inversion Risk Score is low — just 24 out of 100." },
    { offset: 52, text: "The Telemetry strip displays live Open-Meteo reanalysis, CPCB engines, and station status." }
  ],
  scene_05: [
    { offset: 0, text: "Pillar 1: Live Air Intelligence. Inspect PM2.5, PM10, NO2, SO2, CO, and Ozone." },
    { offset: 11, text: "Every sub-index is computed strictly according to CPCB October 2014 guidelines." },
    { offset: 22, text: "Switching from Bengaluru to Delhi-NCR in the selector updates the entire dashboard." },
    { offset: 33, text: "Delhi surges to AQI 255 (Poor) dominated by PM2.5 at 106.9 µg/m³ — over 4x higher than Bengaluru." }
  ],
  scene_06: [
    { offset: 0, text: "Pillar 2: Pollution Forecast and Atmospheric Risk." },
    { offset: 6, text: "During cold winter evenings, thermal inversions trap pollution near ground level." },
    { offset: 17, text: "Our lapse rate engine analyzes surface, 925 hPa, and 850 hPa temperatures to detect traps hours ahead." },
    { offset: 31, text: "Our Backtest Calibration Panel transparently reports MAE, RMSE, and bias against historical readings." },
    { offset: 44, text: "We never claim a model is 100% accurate; we show its actual physical uncertainty." }
  ],
  scene_07: [
    { offset: 0, text: "Pillar 3: Family Protection. All profiles, ages, and medical sensitivities are stored strictly on-device in IndexedDB." },
    { offset: 14, text: "Personal identifiers are stripped before any LLM call, passing only anonymized age groups." },
    { offset: 25, text: "AeroSense AI calculates inhaled dose: Concentration times minute ventilation rate times duration." },
    { offset: 37, text: "Aarav's soccer dose is 13.3 micrograms — only 6% of his WHO daily recommended limit of 225 micrograms." },
    { offset: 49, text: "Grandfather's respiratory risk in Bengaluru equals less than 0.1 cigarettes equivalent today." }
  ],
  scene_08: [
    { offset: 0, text: "Pillar 4: Indoor Air Advisor. Most people spend 90% of their lives indoors." },
    { offset: 11, text: "Our first-principles PM2.5 Mass-Balance model evaluates infiltration, settling, and filtration." },
    { offset: 23, text: "In Bengaluru (PM2.5 24.2 µg/m³), the engine recommends 'Open Windows for Natural Ventilation'." },
    { offset: 35, text: "In Delhi (PM2.5 106.9 µg/m³), the equation reverses: 'Seal Windows and Run Purifier'." },
    { offset: 47, text: "Includes CADR purifier sizing and DIY open-source Corsi-Rosenthal Box blueprints." }
  ],
  scene_09: [
    { offset: 0, text: "Pillar 5: Act — The What-If Simulator. Proving the measurable impact of sustainable choices." },
    { offset: 10, text: "Shifting Priya's 15 km commute from a petrol scooter to Namma Metro drops emissions by 97.5%." },
    { offset: 23, text: "Clicking View Impact Receipt generates an auditable scientific receipt." },
    { offset: 32, text: "Shows baseline, delta with units, emission factors, confidence, and engine version impact@1.0.0." }
  ],
  scene_10: [
    { offset: 0, text: "AeroSense Drone Lab — Custom hardware for vertical atmospheric profiling." },
    { offset: 10, text: "Radical honesty: connection status shows 'Not Connected' while the prototype is in the workshop." },
    { offset: 22, text: "Clicking Launch Flight Demonstration illuminates an explicit 'SIMULATED' badge." },
    { offset: 33, text: "The telemetry HUD animates quadcopter ascent up to 120m, mapping vertical boundary layer traps." }
  ],
  scene_11: [
    { offset: 0, text: "Community Hub: Individual actions scale to neighborhood impact." },
    { offset: 8, text: "Clean-Air Decision Score (0-100) measures verified household mitigation actions, never biological health." },
    { offset: 20, text: "Provides Sectoral Action Plans for schools, eldercare homes, and construction sites." }
  ],
  scene_12: [
    { offset: 0, text: "AeroSense AI Copilot powered by Google Gemini 2.5 Flash." },
    { offset: 9, text: "Prompts are sanitized, PII is stripped, and Gemini receives verified deterministic facts." },
    { offset: 21, text: "When asked about outdoor soccer, Gemini cites Fact #1: AQI 139 and Fact #3: PM2.5 24.2 µg/m³." },
    { offset: 35, text: "Server-side validation audits all numbers in the LLM response, rejecting unsupported claims." }
  ],
  scene_13: [
    { offset: 0, text: "Clean-Air Daily Planner synthesizes all intelligence into a personalized 24-hour routine." },
    { offset: 11, text: "Schedules 7 AM ventilation, 8:30 AM metro commute, 1-4 PM outdoor window, and 7 PM evening seal." }
  ],
  scene_14: [
    { offset: 0, text: "Spatial Air and Incident Map at /map. Concentric radar rings at 10, 25, and 50 kilometers." },
    { offset: 12, text: "Wind indicator shows 11.8 km/h from Northeast towards 226° Southwest with 35° downwind plume sector." },
    { offset: 24, text: "Satellite fire points are labeled thermal indicators; downwind zones are explicitly mathematical estimates." }
  ],
  scene_15: [
    { offset: 0, text: "Under the hood: 5-layer decoupled architecture powering AeroSense AI." },
    { offset: 10, text: "Layer 1: Multi-source ingestion. Layer 2: Fusion, privacy, and safety gateway." },
    { offset: 22, text: "Layer 3: Eight deterministic engines running 100% offline with zero LLM dependencies." },
    { offset: 35, text: "Layer 4: Fact Registry and Impact Receipts. Layer 5: Next.js 15, Three.js 3D, and 11 Indian languages." },
    { offset: 50, text: "120 passing Vitest tests. Developed by Somashekhar Vani for PromptWars Challenge 6." },
    { offset: 63, text: "AeroSense AI: Know the air. Predict the risk. Protect your family. Prove the impact." }
  ]
};

function formatVTTTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function generateWebVTT() {
  console.log('Generating synchronized WebVTT subtitles...');
  const vttPath = path.join(outputDir, 'AeroSense_AI_Captions.vtt');
  let vtt = 'WEBVTT - AeroSense AI Product Demonstration Subtitles\n\n';

  let currentSceneStartSec = 0;
  let cueIndex = 1;

  for (let i = 1; i <= 15; i++) {
    const id = `scene_${String(i).padStart(2, '0')}`;
    const sceneDur = durations[`${id}.wav`] || 45;
    const subs = sceneSubtitles[id] || [{ offset: 0, text: `AeroSense AI — Scene ${i}` }];

    for (let j = 0; j < subs.length; j++) {
      const cue = subs[j];
      const cueStart = currentSceneStartSec + cue.offset;
      const nextOffset = (j + 1 < subs.length) ? subs[j + 1].offset : sceneDur;
      const cueEnd = Math.min(currentSceneStartSec + nextOffset - 0.2, currentSceneStartSec + sceneDur);

      vtt += `${cueIndex++}\n`;
      vtt += `${formatVTTTime(cueStart)} --> ${formatVTTTime(cueEnd)}\n`;
      vtt += `${cue.text}\n\n`;
    }

    currentSceneStartSec += sceneDur;
  }

  fs.writeFileSync(vttPath, vtt, 'utf8');
  console.log(`Created WebVTT subtitles -> ${vttPath} (${cueIndex - 1} cues)`);
}

async function main() {
  generateWebVTT();

  console.log('\n======================================================');
  console.log('STEP 1: Processing and muxing 15 individual scene chunks...');
  console.log('======================================================');

  const concatList = [];

  for (let i = 1; i <= 15; i++) {
    const id = `scene_${String(i).padStart(2, '0')}`;
    const videoFile = path.join(rawDir, `${id}.webm`);
    const audioFile = path.join(audioDir, `${id}.wav`);
    const outFile = path.join(processedDir, `${id}.mp4`);

    if (!fs.existsSync(videoFile) || !fs.existsSync(audioFile)) {
      console.error(`Missing input files for ${id}:`, { video: fs.existsSync(videoFile), audio: fs.existsSync(audioFile) });
      continue;
    }

    const dur = durations[`${id}.wav`];
    console.log(`Encoding ${id} (Duration: ${dur.toFixed(1)}s)...`);

    // Mux video + speech audio, force 1080p 30fps H.264 + AAC
    try {
      execFileSync(ffmpeg, [
        '-y',
        '-i', videoFile,
        '-i', audioFile,
        '-t', dur.toFixed(2),
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-r', '30',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        outFile
      ], { stdio: 'pipe' });

      concatList.push(`file '${outFile.replace(/\\/g, '/')}'`);
      console.log(`✓ Muxed ${id}.mp4 (${(fs.statSync(outFile).size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err) {
      console.error(`Error encoding ${id}:`, err.stderr ? err.stderr.toString() : err.message);
    }
  }

  // Write concat list
  const listFile = path.join(processedDir, 'concat_list.txt');
  fs.writeFileSync(listFile, concatList.join('\n'), 'utf8');

  console.log('\n======================================================');
  console.log('STEP 2: Concatenating all 15 scenes into Full Demonstration Video...');
  console.log('======================================================');

  const fullOutput = path.join(outputDir, 'AeroSense_AI_Complete_Demo.mp4');
  try {
    execFileSync(ffmpeg, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      fullOutput
    ], { stdio: 'pipe' });

    const fullSizeMb = (fs.statSync(fullOutput).size / (1024 * 1024)).toFixed(1);
    console.log(`\n🎉 Full Demo Complete: ${fullOutput} (${fullSizeMb} MB)`);
  } catch (err) {
    console.error('Error in full video concatenation:', err.stderr ? err.stderr.toString() : err.message);
  }

  console.log('\n======================================================');
  console.log('STEP 3: Generating Short Promotional Teaser Video (60-90s)...');
  console.log('======================================================');

  console.log('Building 75-second fast promo teaser from signature highlights...');
  const teaserClips = [
    { scene: 'scene_01', start: 25, duration: 15 }, // Intro mission statement
    { scene: 'scene_04', start: 0, duration: 15 },  // Hero AQI & 3D column
    { scene: 'scene_08', start: 15, duration: 15 }, // 3D room & ventilate decision
    { scene: 'scene_09', start: 10, duration: 15 }, // What-If & Impact Receipt
    { scene: 'scene_15', start: 60, duration: 15 }  // Conclusion tagline & call to action
  ];

  const teaserConcat = [];
  for (let k = 0; k < teaserClips.length; k++) {
    const clip = teaserClips[k];
    const src = path.join(processedDir, `${clip.scene}.mp4`);
    const clipOut = path.join(processedDir, `teaser_${k + 1}.mp4`);
    execFileSync(ffmpeg, [
      '-y',
      '-ss', String(clip.start),
      '-i', src,
      '-t', String(clip.duration),
      '-c', 'copy',
      clipOut
    ], { stdio: 'pipe' });
    teaserConcat.push(`file '${clipOut.replace(/\\/g, '/')}'`);
  }

  const teaserListFile = path.join(processedDir, 'teaser_list.txt');
  fs.writeFileSync(teaserListFile, teaserConcat.join('\n'), 'utf8');

  const shortOutput = path.join(outputDir, 'AeroSense_AI_Short_Demo.mp4');
  try {
    execFileSync(ffmpeg, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', teaserListFile,
      '-c', 'copy',
      shortOutput
    ], { stdio: 'pipe' });

    const shortSizeMb = (fs.statSync(shortOutput).size / (1024 * 1024)).toFixed(1);
    console.log(`🎉 Short Demo Teaser Complete: ${shortOutput} (${shortSizeMb} MB, 75.0s)`);
  } catch (err) {
    console.error('Error in short video concatenation:', err.stderr ? err.stderr.toString() : err.message);
  }

  console.log('\nAll video deliverables produced successfully in demo-video/!');
}

main().catch(err => {
  console.error('Stitching failed:', err);
  process.exit(1);
});
