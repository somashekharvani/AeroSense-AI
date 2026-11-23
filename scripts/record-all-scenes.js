const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const rawDir = path.resolve('demo-video', 'raw');
if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

const durationsPath = path.resolve('demo-video', 'audio', 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

const BASE_URL = 'https://aero-sense-ai-psi.vercel.app';

async function recordScene(sceneIndex, sceneId, runInteractions) {
  const targetDurationMs = Math.ceil(durations[`${sceneId}.wav`] * 1000);
  console.log(`\n======================================================`);
  console.log(`Recording ${sceneId} (Target duration: ${(targetDurationMs / 1000).toFixed(1)}s)...`);
  console.log(`======================================================`);

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } }
  });

  const page = await context.newPage();
  const startTime = Date.now();

  try {
    await runInteractions(page, targetDurationMs);
  } catch (err) {
    console.error(`Interaction error in ${sceneId}:`, err.message);
  }

  // Ensure recording fills the audio duration
  const elapsed = Date.now() - startTime;
  if (elapsed < targetDurationMs) {
    const remain = targetDurationMs - elapsed;
    console.log(`Pacing wait for ${sceneId}: ${(remain / 1000).toFixed(1)}s`);
    await page.waitForTimeout(remain);
  }

  const tempVideoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Rename to deterministic scene name
  const finalPath = path.join(rawDir, `${sceneId}.webm`);
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(tempVideoPath, finalPath);
  console.log(`Successfully recorded ${sceneId} -> ${finalPath} (${(fs.statSync(finalPath).size / 1024).toFixed(0)} KB)`);
}

async function main() {
  // SCENE 01: Intro Title Card
  await recordScene(1, 'scene_01', async (page, dur) => {
    const fileUrl = 'file://' + path.resolve('demo-video', 'scene_01_intro.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(dur);
  });

  // SCENE 02: Bengaluru Sharma Family Scenario Card
  await recordScene(2, 'scene_02', async (page, dur) => {
    const fileUrl = 'file://' + path.resolve('demo-video', 'scene_02_scenario.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(dur);
  });

  // SCENE 03: Landing Page (/)
  await recordScene(3, 'scene_03', async (page, dur) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    // Smooth scroll down
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    // Scroll back up and hover CTA
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    const cta = page.locator('text=Launch Dashboard').first();
    if (await cta.isVisible()) {
      await cta.hover();
      await page.waitForTimeout(2000);
    }
  });

  // SCENE 04: Overview Dashboard (/overview)
  await recordScene(4, 'scene_04', async (page, dur) => {
    await page.goto(`${BASE_URL}/overview`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Hover over CPCB AQI card
    await page.mouse.move(400, 320);
    await page.waitForTimeout(6000);
    // Move to 3D scene
    await page.mouse.move(1100, 350);
    await page.waitForTimeout(8000);
    // Scroll down to view source telemetry strip
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(8000);
  });

  // SCENE 05: Live Air Intelligence (/live)
  await recordScene(5, 'scene_05', async (page, dur) => {
    await page.goto(`${BASE_URL}/live`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Hover sub-indices table
    await page.mouse.move(500, 450);
    await page.waitForTimeout(6000);
    // Demonstrate City Dropdown selection
    const locationBtn = page.locator('button:has-text("Bengaluru"), button:has-text("Selected City"), button:has-text("Delhi")').first();
    if (await locationBtn.isVisible()) {
      await locationBtn.click();
      await page.waitForTimeout(2000);
      const delhiOpt = page.locator('text=Delhi').first();
      if (await delhiOpt.isVisible()) {
        await delhiOpt.click();
        console.log('Switched location to Delhi');
        await page.waitForTimeout(8000);
        // Switch back to Bengaluru
        if (await locationBtn.isVisible()) {
          await locationBtn.click();
          await page.waitForTimeout(1500);
          const blrOpt = page.locator('text=Bengaluru').first();
          if (await blrOpt.isVisible()) await blrOpt.click();
          console.log('Switched location back to Bengaluru');
        }
      }
    }
    await page.waitForTimeout(5000);
  });

  // SCENE 06: Forecast & Inversion Risk (/forecast)
  await recordScene(6, 'scene_06', async (page, dur) => {
    await page.goto(`${BASE_URL}/forecast`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Scrub over 48h chart
    for (let x = 300; x <= 1400; x += 150) {
      await page.mouse.move(x, 420);
      await page.waitForTimeout(800);
    }
    // Scroll down to lapse rate and backtest panel
    await page.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
    await page.waitForTimeout(8000);
  });

  // SCENE 07: Family Protection (/family)
  await recordScene(7, 'scene_07', async (page, dur) => {
    await page.goto(`${BASE_URL}/family`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Hover over Aarav (child) card
    await page.mouse.move(400, 360);
    await page.waitForTimeout(6000);
    // Hover over Priya card
    await page.mouse.move(800, 360);
    await page.waitForTimeout(6000);
    // Hover over Grandfather card
    await page.mouse.move(1200, 360);
    await page.waitForTimeout(6000);
    // Scroll down to WHO budget bar
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 08: Indoor Air Advisor (/indoor)
  await recordScene(8, 'scene_08', async (page, dur) => {
    await page.goto(`${BASE_URL}/indoor`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Move mouse across 3D room cutaway
    await page.mouse.move(700, 350);
    await page.waitForTimeout(3000);
    await page.mouse.move(900, 420);
    await page.waitForTimeout(5000);
    // Scroll to ventilate-vs-seal decision card & CADR calculator
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(8000);
    // Scroll to Corsi-Rosenthal DIY section
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 09: What-If Simulator (/what-if)
  await recordScene(9, 'scene_09', async (page, dur) => {
    await page.goto(`${BASE_URL}/what-if`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Interact with commute slider or buttons
    const transitBtn = page.locator('button:has-text("Metro"), button:has-text("Electric")').first();
    if (await transitBtn.isVisible()) {
      await transitBtn.click();
      await page.waitForTimeout(3000);
    }
    // Expand Impact Receipt
    const receiptBtn = page.locator('button:has-text("Impact Receipt"), text=Impact Receipt').first();
    if (await receiptBtn.isVisible()) {
      await receiptBtn.click();
      await page.waitForTimeout(6000);
    }
    await page.waitForTimeout(6000);
  });

  // SCENE 10: Drone Lab (/drone)
  await recordScene(10, 'scene_10', async (page, dur) => {
    await page.goto(`${BASE_URL}/drone`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    // Hover over NOT CONNECTED status banner
    await page.mouse.move(400, 240);
    await page.waitForTimeout(4000);
    // Click Launch Simulated Demo
    const demoBtn = page.locator('button:has-text("Simulated"), button:has-text("Demo"), button:has-text("Launch")').first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      console.log('Clicked Launch Flight Demo');
      await page.waitForTimeout(8000);
    }
    // Scroll to vertical profiling HUD
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 11: Community Hub (/community)
  await recordScene(11, 'scene_11', async (page, dur) => {
    await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Hover Clean-Air Decision Score card
    await page.mouse.move(500, 320);
    await page.waitForTimeout(5000);
    // Scroll through Sectoral Action Plans
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 12: AI Copilot (/copilot)
  await recordScene(12, 'scene_12', async (page, dur) => {
    await page.goto(`${BASE_URL}/copilot`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Type question in copilot input
    const promptInput = page.locator('input[type="text"], textarea').first();
    if (await promptInput.isVisible()) {
      await promptInput.fill('Is it safe for Aarav to play outdoor soccer this afternoon in Bengaluru?');
      await page.waitForTimeout(2000);
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        console.log('Submitted Copilot question');
        await page.waitForTimeout(10000);
      }
    }
    // Inspect fact citations
    await page.mouse.move(600, 500);
    await page.waitForTimeout(6000);
  });

  // SCENE 13: Clean-Air Daily Planner (/planner)
  await recordScene(13, 'scene_13', async (page, dur) => {
    await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    // Scroll through 24h timeline
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
  });

  // SCENE 14: Pollution Map & Spatial Radar (/map)
  await recordScene(14, 'scene_14', async (page, dur) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    // Click Filter Pills: Stations, Fires, All
    const stationsPill = page.locator('button:has-text("Stations")').first();
    if (await stationsPill.isVisible()) {
      await stationsPill.click();
      await page.waitForTimeout(2500);
    }
    const firesPill = page.locator('button:has-text("Fires")').first();
    if (await firesPill.isVisible()) {
      await firesPill.click();
      await page.waitForTimeout(2500);
    }
    const allPill = page.locator('button:has-text("All")').first();
    if (await allPill.isVisible()) {
      await allPill.click();
      await page.waitForTimeout(2500);
    }
    // Hover on radar wind vector & downwind plume
    await page.mouse.move(700, 480);
    await page.waitForTimeout(6000);
  });

  // SCENE 15: Architecture & PromptWars Conclusion
  await recordScene(15, 'scene_15', async (page, dur) => {
    // Part A: Show System Architecture (40s)
    await page.goto(`${BASE_URL}/architecture/architecture.svg`, { waitUntil: 'load' });
    await page.waitForTimeout(38000);
    // Part B: Transition to Outro Title Card
    const fileUrl = 'file://' + path.resolve('demo-video', 'scene_15_outro.html').replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(dur - 38000);
  });

  console.log('\n======================================================');
  console.log('ALL 15 SCENES RECORDED SUCCESSFULLY IN demo-video/raw/');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Recording pipeline failed:', err);
  process.exit(1);
});
