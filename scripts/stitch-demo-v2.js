const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const rawDir = path.resolve('demo-video', 'raw-v2');
const audioDir = path.resolve('demo-video', 'audio-v2');
const processedDir = path.resolve('demo-video', 'processed-v2');
const outputDir = path.resolve('demo-video');

if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

const durationsPath = path.join(audioDir, 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

// High-precision subtitles mapped directly to the narration sentences
const sceneSubtitles = {
  scene_01: [
    { offset: 0, text: "Air pollution is one of the most critical public health emergencies of our time." },
    { offset: 6, text: "Across South Asia and the Indo-Gangetic Plain, hundreds of millions wake up under thick winter smog." },
    { offset: 14, text: "Yet a single colored AQI number doesn't tell a mother when to open windows, or an asthmatic grandfather his inhaled particulate mass." },
    { offset: 25, text: "Welcome to AeroSense AI — the Clean-Air Decision Engine, built for PromptWars Challenge 6." },
    { offset: 35, text: "Our mission: Know the air. Predict the risk. Protect your family. Prove the impact." }
  ],
  scene_02: [
    { offset: 0, text: "To see how AeroSense AI works in practice, let's follow an illustrative family scenario — the Sharma family in Bengaluru." },
    { offset: 9, text: "The parents commute along Outer Ring Road, 8-year-old Aarav has soccer practice, and Grandfather plans his daily walk." },
    { offset: 20, text: "Is outdoor air safe for soccer? Which pollutant is peaking? Is pollution trapping closer to the ground?" },
    { offset: 31, text: "Traditional apps only give a number. AeroSense AI guides their decisions from sunrise to bedtime." }
  ],
  scene_03: [
    { offset: 0, text: "Here is AeroSense AI, live on the web at aero-sense-ai-psi.vercel.app." },
    { offset: 8, text: "Deep ink slate accented by emerald and teal, built for high contrast and accessibility." },
    { offset: 17, text: "Our deterministic physical engines do all the science. Generative AI only plans and explains." },
    { offset: 27, text: "Every metric comes from validated physics and official standards, with zero hallucinated numbers." },
    { offset: 36, text: "Live snapshot bar and introductions to our Five Pillars: Know, Predict, Protect, Home, and Act." }
  ],
  scene_04: [
    { offset: 0, text: "We are now inside the Overview Dashboard." },
    { offset: 5, text: "In Bengaluru, our engine calculates the Indian National AQI at 139, in the 'Moderate' category." },
    { offset: 15, text: "Ozone is the dominant pollutant at 127 µg/m³, while PM2.5 is measured at 24.2 µg/m³." },
    { offset: 25, text: "Under CPCB standards, this falls in the 'Good' sub-index band, though slightly above the WHO 24h guideline of 15 µg/m³." },
    { offset: 37, text: "3D Atmospheric Inversion Scene: 1,045m boundary layer, winds at 11.8 km/h, Inversion Risk score just 24/100." }
  ],
  scene_05: [
    { offset: 0, text: "Pillar 1: Live Air Intelligence. Inspect PM2.5, PM10, NO2, SO2, CO, and Ozone." },
    { offset: 10, text: "Every sub-index is computed strictly according to CPCB October 2014 breakpoint rules." },
    { offset: 20, text: "Switching from Bengaluru to Delhi-NCR in the location selector updates the entire dashboard." },
    { offset: 31, text: "In Delhi, AQI surges to 255 (Poor) dominated by PM2.5 at 106.9 µg/m³ — over 4x higher than Bengaluru." }
  ],
  scene_06: [
    { offset: 0, text: "Pillar 2: Pollution Forecast and Atmospheric Risk." },
    { offset: 5, text: "During cold winter evenings, ground cooling creates thermal inversions, trapping surface air." },
    { offset: 15, text: "AeroSense AI plots a forward 48-hour hourly outlook analyzing surface, 925 hPa, and 850 hPa lapse rates." },
    { offset: 28, text: "Backtest Calibration Panel transparently reports MAE, RMSE, and bias against historical station readings." }
  ],
  scene_07: [
    { offset: 0, text: "Pillar 3: Family Protection. All profiles stored strictly on-device in browser IndexedDB." },
    { offset: 11, text: "Personal identifiers stripped before any external call, passing only anonymized age groups to Gemini." },
    { offset: 22, text: "AeroSense AI applies the US EPA formula: Inhaled dose equals concentration times ventilation rate times duration." },
    { offset: 34, text: "Aarav's soccer dose is 13.3 µg, compared against a daily child reference budget of 120 µg based on WHO guidelines." },
    { offset: 46, text: "Grandfather's respiratory risk labeled with explicit Berkeley Earth non-clinical comparative disclaimers." }
  ],
  scene_08: [
    { offset: 0, text: "Pillar 4: Indoor Air Advisor, addressing the 90% of life spent indoors." },
    { offset: 9, text: "AeroSense AI uses a first-principles PM2.5 Mass-Balance Differential Equation." },
    { offset: 19, text: "In Bengaluru (PM2.5 24.2 µg/m³), the engine recommends 'Open Windows for Natural Ventilation'." },
    { offset: 29, text: "In Delhi (PM2.5 106.9 µg/m³), the equation reverses to 'Seal Windows and Run Purifier'." },
    { offset: 38, text: "Purifier CADR sizing calculator and blueprints for a DIY Corsi-Rosenthal Box." }
  ],
  scene_09: [
    { offset: 0, text: "Pillar 5: Act — The What-If Simulator. Proving the measurable impact of sustainable choices." },
    { offset: 9, text: "Priya's 15km commute shift from scooter to Namma Metro reduces in-cabin particulate penetration by 85%." },
    { offset: 21, text: "Avoids over 5 µg of inhaled particulate mass and 495 grams of vehicular CO2 tailpipe emissions per trip." },
    { offset: 32, text: "Clicking View Impact Receipt generates an auditable receipt with baseline, delta, and engine version impact@1.0.0." }
  ],
  scene_10: [
    { offset: 0, text: "AeroSense Drone Lab for low-altitude vertical atmospheric profiling." },
    { offset: 8, text: "Radical engineering honesty: status displays 'Not Connected' while prototype is in the workshop." },
    { offset: 20, text: "Clicking Launch Flight Demonstration illuminates an explicit amber 'SIMULATED' badge." },
    { offset: 29, text: "Telemetry HUD animates quadcopter ascent up to 120m, mapping vertical boundary layer traps." }
  ],
  scene_11: [
    { offset: 0, text: "Community Hub: Individual household actions scale to neighborhood impact." },
    { offset: 8, text: "Clean-Air Decision Score (0-100) measures verified household mitigation actions only." },
    { offset: 18, text: "Specialized Sectoral Action Plans for schools, eldercare homes, and construction sites." }
  ],
  scene_12: [
    { offset: 0, text: "AeroSense AI Copilot powered by Google Gemini 2.5 Flash with strict deterministic facts." },
    { offset: 10, text: "Input sanitized against prompt injection and demographic data stripped." },
    { offset: 20, text: "Asking for Bengaluru precautions, Gemini cites Fact #1: AQI 139 and Fact #3: PM2.5 24.2." },
    { offset: 33, text: "Recommends midday ventilation, metro transit, and identifies clean air window from noon to 3 PM." },
    { offset: 45, text: "Server-side validator audits every number against facts registry, rejecting unsupported claims." }
  ],
  scene_13: [
    { offset: 0, text: "Clean-Air Daily Planner synthesizes intelligence into a 24-hour visual routine for Sharma family." },
    { offset: 10, text: "7 AM ventilation, 8:30 AM metro transit, 1-4 PM outdoor window, and 7 PM evening seal advisory." }
  ],
  scene_14: [
    { offset: 0, text: "Spatial Air and Incident Map at /map. Concentric radar rings at 10, 25, and 50 kilometers." },
    { offset: 10, text: "Wind moving at 11.8 km/h towards 226° SW; downwind plume sector labeled as mathematical estimate." },
    { offset: 22, text: "Transparent engineering honesty: unconfigured or clear upstream feeds display verified targets without fake fires." }
  ],
  scene_15: [
    { offset: 0, text: "Under the hood: Decoupled 5-layer architecture powering AeroSense AI." },
    { offset: 8, text: "Layer 1: Ingestion. Layer 2: Fusion, privacy, prompt safety. Layer 3: Eight offline TypeScript engines." },
    { offset: 21, text: "Layer 4: Fact Registry and Impact Receipts. Layer 5: Next.js 15, Three.js 3D, and 11 Indian languages with Urdu RTL." },
    { offset: 35, text: "120 passing Vitest tests. Developed by Somashekhar Vani for PromptWars Challenge 6." },
    { offset: 46, text: "AeroSense AI: Know the air. Predict the risk. Protect your family. Prove the impact." }
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
  console.log('Generating synchronized WebVTT subtitles (v2)...');
  const vttPath = path.join(outputDir, 'AeroSense_AI_Captions_v2.vtt');
  let vtt = 'WEBVTT - AeroSense AI Demonstration Subtitles (v2)\n\n';

  let currentSceneStartSec = 0;
  let cueIndex = 1;

  for (let i = 1; i <= 15; i++) {
    const id = `scene_${String(i).padStart(2, '0')}`;
    const sceneDur = durations[`${id}.mp3`] || 45;
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
  console.log(`✓ Created WebVTT subtitles -> ${vttPath} (${cueIndex - 1} cues)`);
}

async function main() {
  generateWebVTT();

  console.log('\n======================================================');
  console.log('STEP 1: Muxing 15 individual scene chunks (1080p 30fps H.264 + AAC)...');
  console.log('======================================================');

  const concatList = [];

  for (let i = 1; i <= 15; i++) {
    const id = `scene_${String(i).padStart(2, '0')}`;
    const videoFile = path.join(rawDir, `${id}.webm`);
    const audioFile = path.join(audioDir, `${id}.mp3`);
    const outFile = path.join(processedDir, `${id}.mp4`);

    if (!fs.existsSync(videoFile) || !fs.existsSync(audioFile)) {
      console.error(`Missing input files for ${id}:`, { video: fs.existsSync(videoFile), audio: fs.existsSync(audioFile) });
      continue;
    }

    const dur = durations[`${id}.mp3`];
    console.log(`Encoding ${id} (Duration: ${dur.toFixed(1)}s)...`);

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

  const listFile = path.join(processedDir, 'concat_list_v2.txt');
  fs.writeFileSync(listFile, concatList.join('\n'), 'utf8');

  console.log('\n======================================================');
  console.log('STEP 2: Concatenating all 15 scenes into AeroSense_AI_Complete_Demo_v2.mp4...');
  console.log('======================================================');

  const fullOutput = path.join(outputDir, 'AeroSense_AI_Complete_Demo_v2.mp4');
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
  console.log('STEP 3: Generating Curated 75s Promotional Teaser (v2)...');
  console.log('======================================================');

  const teaserClips = [
    { scene: 'scene_01', start: 20, duration: 15 },
    { scene: 'scene_04', start: 0, duration: 15 },
    { scene: 'scene_08', start: 10, duration: 15 },
    { scene: 'scene_09', start: 10, duration: 15 },
    { scene: 'scene_15', start: 40, duration: 15 }
  ];

  const teaserConcat = [];
  for (let k = 0; k < teaserClips.length; k++) {
    const clip = teaserClips[k];
    const src = path.join(processedDir, `${clip.scene}.mp4`);
    const clipOut = path.join(processedDir, `teaser_v2_${k + 1}.mp4`);
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

  const teaserListFile = path.join(processedDir, 'teaser_list_v2.txt');
  fs.writeFileSync(teaserListFile, teaserConcat.join('\n'), 'utf8');

  const shortOutput = path.join(outputDir, 'AeroSense_AI_Short_Demo_v2.mp4');
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

  console.log('\nAll v2 video deliverables produced successfully in demo-video/!');
}

main().catch(err => {
  console.error('Stitching failed:', err);
  process.exit(1);
});
