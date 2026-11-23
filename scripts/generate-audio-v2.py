import asyncio
import edge_tts
import json
import os
import subprocess

VOICE = "en-IN-PrabhatNeural"
RATE = "+15%"
OUTPUT_DIR = os.path.join("demo-video", "audio-v2")
DURATIONS_FILE = os.path.join(OUTPUT_DIR, "durations.json")

SCENES = {
    "scene_01": (
        "Air pollution is one of the most critical public health emergencies of our time. "
        "Across South Asia and the Indo-Gangetic Plain, hundreds of millions wake up under thick winter smog. "
        "Yet a single colored air quality number doesn't tell a mother when to open windows, "
        "nor an asthmatic grandfather his inhaled particulate mass during an evening walk. "
        "Welcome to AeroSense AI — the Clean-Air Decision Engine. "
        "Built for PromptWars Challenge 6, AeroSense AI transforms atmospheric physics into actionable, auditable household decisions. "
        "Our mission: Know the air. Predict the risk. Protect your family. Prove the impact."
    ),
    "scene_02": (
        "To see how AeroSense AI works in practice, let's follow an illustrative family scenario — the Sharma family in Bengaluru. "
        "The parents commute along Outer Ring Road. Their eight-year-old son, Aarav, is packing for afternoon soccer practice. "
        "And Aarav's grandfather, living with mild asthma, is planning his daily walk. "
        "Before stepping out, they face vital questions: Is outdoor air safe for soccer today? "
        "Which pollutant is peaking? Is pollution trapping closer to the ground this evening? "
        "Should they ventilate now, or keep windows sealed? "
        "Traditional apps only give a number. AeroSense AI guides their decisions from sunrise to bedtime."
    ),
    "scene_03": (
        "Here is AeroSense AI, live on the web at aero-sense-ai-psi.vercel.app. "
        "Notice our dark environmental intelligence design — deep ink slate accented by emerald and teal, built for high contrast and accessibility. "
        "Right on the homepage, we state our core philosophy: our own deterministic physical engines do all the science. "
        "Generative AI only plans and explains. "
        "Every metric comes from validated physics and official standards, with zero hallucinated numbers. "
        "Notice the live snapshot bar showing current city conditions, and introductions to our Five Pillars: Know, Predict, Protect, Home, and Act. "
        "Let's enter the platform by clicking Launch Dashboard."
    ),
    "scene_04": (
        "We are now inside the Overview Dashboard. "
        "In Bengaluru right now, our engine calculates the Indian National AQI at 139, in the 'Moderate' category. "
        "Ozone is the dominant pollutant at 127 micrograms per cubic meter, "
        "while fine PM2.5 is measured at 24.2 micrograms per cubic meter. "
        "Under CPCB standards, this falls within the 'Good' sub-index band, though slightly above the WHO 24-hour guideline of 15 micrograms. "
        "Beside the telemetry, our 3D Atmospheric Inversion Scene visualizes the vertical air column. "
        "With a boundary layer height of 1,045 meters and winds at 11.8 kilometers per hour, our Inversion Risk Score is low — just 24 out of 100. "
        "The atmosphere is actively dispersing pollutants upward."
    ),
    "scene_05": (
        "Moving to Pillar 1: Live Air Intelligence. "
        "Users can inspect all six criteria pollutants: PM2.5, PM10, NO2, SO2, CO, and Ozone. "
        "Every sub-index is computed strictly according to CPCB October 2014 breakpoint rules. "
        "Now, let's demonstrate multi-city intelligence. "
        "Switching our location from Bengaluru to Delhi-NCR updates the entire dashboard. "
        "In Delhi, the CPCB AQI surges to 255 — classified as 'Poor'. "
        "Delhi's air is heavily dominated by particulates, with PM2.5 reaching 106.9 micrograms per cubic meter — over four times higher than Bengaluru. "
        "Let's switch back to Bengaluru to continue our walk-through."
    ),
    "scene_06": (
        "Next is Pillar 2: Pollution Forecast and Atmospheric Risk. "
        "During cold winter evenings, ground cooling creates thermal inversions, trapping surface air beneath a warm ceiling. "
        "AeroSense AI plots a forward 48-hour hourly outlook. "
        "By analyzing lapse rates between surface, 925 hPa, and 850 hPa levels, our engine detects inversion traps hours ahead. "
        "In Bengaluru, concentrations remain stable through the afternoon, with a slight nocturnal dip in the boundary layer around midnight. "
        "Our Backtest Calibration Panel transparently reports MAE, RMSE, and bias against historical station readings, "
        "distinguishing forecast projections from verified ground measurements."
    ),
    "scene_07": (
        "Now let's open Pillar 3: Family Protection. "
        "All family profiles and sensitivities are stored strictly on-device in browser IndexedDB. "
        "Personal identifiers are stripped before any external call, passing only anonymized age groups to Gemini. "
        "Here are our illustrative profiles: Aarav, age eight; Priya, age 36; and Grandfather, age 68, an asthmatic senior. "
        "AeroSense AI applies the US EPA formula: Inhaled dose equals concentration times ventilation rate times duration. "
        "For Aarav during soccer, his estimated dose is 13.3 micrograms, compared against a daily child reference budget of 120 micrograms based on WHO guidelines. "
        "For Grandfather, afternoon air remains manageable, with Berkeley Earth comparisons clearly labeled as illustrative non-clinical estimates."
    ),
    "scene_08": (
        "In Pillar 4: Indoor Air Advisor, we address the 90% of life spent indoors. "
        "AeroSense AI uses a first-principles PM2.5 Mass-Balance Differential Equation, "
        "modeling infiltration, settling, cooking emissions, and mechanical filtration. "
        "In our interactive 3D room, because Bengaluru PM2.5 is 24.2 micrograms per cubic meter, "
        "the engine recommends 'Open Windows for Natural Ventilation' to dilute carbon dioxide safely. "
        "In Delhi, where outdoor PM2.5 is 106.9 micrograms, the equation reverses to 'Seal Windows and Run Purifier'. "
        "The page also provides purifier CADR sizing and DIY Corsi-Rosenthal Box blueprints."
    ),
    "scene_09": (
        "In Pillar 5: Act — The What-If Simulator, families simulate everyday environmental choices. "
        "For Priya's 15-kilometer daily commute, shifting from a petrol two-wheeler to the air-filtered Namma Metro reduces in-cabin particulate penetration by 85%, "
        "avoiding over 5 micrograms of inhaled particulate mass. "
        "Simultaneously, from an emissions perspective, switching to electric rail avoids 495 grams of vehicular carbon dioxide tailpipe emissions per trip. "
        "Clicking View Impact Receipt generates an auditable receipt with baseline, delta, emission factors, and engine version impact@1.0.0. "
        "Every number is traceable."
    ),
    "scene_10": (
        "Next, the AeroSense Drone Lab for low-altitude vertical atmospheric profiling. "
        "Here, we practice radical engineering honesty: the connection banner clearly shows 'Not Connected' "
        "because our physical prototype — with Arduino Nano, ESP8266, MQ-135, and DHT22 — is in the workshop. "
        "We never fake live telemetry. "
        "Clicking Launch Flight Demonstration activates an explicit amber 'SIMULATED' badge. "
        "The HUD animates quadcopter ascent up to 120 meters, showing how optical particle counters and LiDAR will profile vertical pollution traps."
    ),
    "scene_11": (
        "In the Community Hub, individual household actions scale to neighborhood impact. "
        "Our Clean-Air Decision Score from 0 to 100 measures verified household mitigation actions, never biological health or medical status. "
        "The page also provides specialized Sectoral Action Plans: "
        "guidelines for school principals on scheduling morning physical education, "
        "sanctuary protocols for eldercare homes, "
        "and dust-suppression checklists for construction site managers."
    ),
    "scene_12": (
        "Now, the AeroSense AI Copilot, powered by Google Gemini 2.5 Flash. "
        "Before Gemini receives a prompt, user input is sanitized against prompt injection and demographic data is stripped. "
        "Crucially, Gemini is provided with a strict JSON payload of verified deterministic facts. "
        "Watch as we ask: 'What precautions should a family in Bengaluru take based on the current air-quality conditions?' "
        "We submit the query, and the Copilot returns a complete plan. "
        "Gemini cites Fact #1: CPCB AQI 139 Moderate, and Fact #3: PM2.5 24.2 with open boundary layer of 1,045 meters. "
        "It recommends brief midday ventilation, advises metro transit, and identifies the clean air window from noon to 3:00 PM. "
        "Our server-side validator audits every number, rejecting unsupported claims."
    ),
    "scene_13": (
        "In the Clean-Air Daily Planner, all intelligence synthesizes into a 24-hour visual routine for the Sharma family: "
        "a 7:00 AM brief ventilation window, "
        "an 8:30 AM recommendation to use Namma Metro, "
        "an afternoon outdoor window between 1:00 PM and 4:00 PM when atmospheric convective mixing is strongest, "
        "and a 7:00 PM seal advisory before nocturnal cooling sets in. "
        "Every item includes an action badge, estimated exposure reduction, and direct scientific fact link."
    ),
    "scene_14": (
        "In the Spatial Air and Incident Map at /map, users inspect regional vectors across 10, 25, and 50-kilometer radar rings. "
        "Winds are moving at 11.8 kilometers per hour towards 226 degrees southwest. "
        "Our incident engine calculates downwind dispersion across a 35-degree plume sector, labeled as a mathematical estimate. "
        "When upstream satellite or station feeds are clear or unconfigured, AeroSense AI adheres to engineering honesty — "
        "displaying the verified target and wind vectors without inventing synthetic fire points or fake stations."
    ),
    "scene_15": (
        "Under the hood, AeroSense AI runs on a decoupled 5-layer architecture: "
        "Layer 1 ingests Open-Meteo, WAQI stations, NASA FIRMS, and drone telemetry. "
        "Layer 2 handles data fusion, on-device privacy in IndexedDB, and prompt sanitization. "
        "Layer 3 hosts eight pure TypeScript scientific engines running 100% offline with zero LLM dependencies. "
        "Layer 4 audits metrics in the Fact Registry, generating auditable Impact Receipts. "
        "Layer 5 delivers Next.js 15, Three.js 3D, and 11 Indian languages with Urdu RTL. "
        "Verified with 120 automated tests, built by Somashekhar Vani for PromptWars Challenge 6, and live at aero-sense-ai-psi.vercel.app. "
        "AeroSense AI: Know the air. Predict the risk. Protect your family. Prove the impact. Thank you."
    )
}

def get_audio_duration_seconds(file_path):
    try:
        result = subprocess.run(
            ['node', '-e', f"const {{execFileSync}} = require('child_process'); const ffmpeg = require('ffmpeg-static'); try {{ execFileSync(ffmpeg, ['-i', '{file_path.replace(os.sep, '/')}'], {{stdio: 'pipe'}}); }} catch(e) {{ const m = e.stderr.toString().match(/Duration:\\s*(\\d+):(\\d+):(\\d+\\.\\d+)/); if (m) {{ console.log(Number(m[1])*3600 + Number(m[2])*60 + Number(m[3])); }} }}"],
            capture_output=True,
            text=True,
            check=True
        )
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Error measuring duration for {file_path}: {e}")
        return 45.0

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    durations = {}
    total_sec = 0.0

    print("======================================================")
    print("Generating 15 Calibrated Natural Indian English Narration Tracks (v2)...")
    print(f"Voice: {VOICE} (Conversational rate: {RATE})")
    print("======================================================\n")

    for scene_id, text in SCENES.items():
        out_mp3 = os.path.join(OUTPUT_DIR, f"{scene_id}.mp3")
        word_count = len(text.split())
        print(f"Synthesizing {scene_id} ({word_count} words)...")
        communicator = edge_tts.Communicate(text, VOICE, rate=RATE)
        await communicator.save(out_mp3)

        dur = get_audio_duration_seconds(out_mp3)
        durations[f"{scene_id}.mp3"] = round(dur, 2)
        total_sec += dur
        wpm = round((word_count / dur) * 60)
        print(f"[OK] {scene_id}.mp3 -> {dur:.2f}s (~{wpm} WPM)")

    with open(DURATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2)

    print("\n======================================================")
    print(f"All 15 scene audio files generated successfully in {OUTPUT_DIR}/")
    print(f"Total Spoken Narration Duration: {total_sec:.2f}s ({total_sec/60:.2f} minutes / {int(total_sec//60)}m {int(total_sec%60)}s)")
    print(f"Target Window: ~675 seconds (11m 15s)")
    print("======================================================")

if __name__ == "__main__":
    asyncio.run(main())
