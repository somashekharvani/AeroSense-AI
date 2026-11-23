const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const rawDir = path.resolve('demo-video', 'raw-v2');
if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

const durationsPath = path.resolve('demo-video', 'audio-v2', 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

const BASE_URL = 'https://aero-sense-ai-psi.vercel.app';

async function recordScene(sceneId, runInteractions) {
  const targetDurationMs = Math.ceil(durations[`${sceneId}.mp3`] * 1000);
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

  // Targeted suppression ONLY for the welcome onboarding modal
  await context.addInitScript(() => {
    try {
      localStorage.setItem('aerosense_has_visited', 'true');
      const style = document.createElement('style');
      style.innerHTML = 'div[role="dialog"][aria-labelledby="welcome-heading"] { display: none !important; pointer-events: none !important; }';
      if (document.head) document.head.appendChild(style);
      else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    } catch (_) {}
  });

  const page = await context.newPage();
  const startTime = Date.now();

  try {
    await runInteractions(page, targetDurationMs);
  } catch (err) {
    console.error(`Interaction error in ${sceneId}:`, err.message);
  }

  // Ensure recording fills the exact audio duration with natural visual hold
  const elapsed = Date.now() - startTime;
  if (elapsed < targetDurationMs) {
    const remain = targetDurationMs - elapsed;
    console.log(`Natural hold for ${sceneId}: ${(remain / 1000).toFixed(1)}s`);
    await page.waitForTimeout(remain);
  }

  const tempVideoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = path.join(rawDir, `${sceneId}.webm`);
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(tempVideoPath, finalPath);
  console.log(`✓ Completed ${sceneId} -> ${finalPath} (${(fs.statSync(finalPath).size / 1024).toFixed(0)} KB)`);
}

async function dismissWelcomeIfPresent(page) {
  try {
    await page.evaluate(() => {
      const modal = document.querySelector('div[aria-labelledby="welcome-heading"]');
      if (modal) modal.remove();
    });
  } catch (_) {}
}

async function main() {
  // SCENE 01: Problem Statement & AeroSense AI Intro
  await recordScene('scene_01', async (page) => {
    const fileUrl = `file://${path.resolve('demo-video', 'scene_01_intro.html').replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(10000);
    await page.mouse.move(960, 500);
    await page.waitForTimeout(10000);
  });

  // SCENE 02: Illustrative Family Scenario
  await recordScene('scene_02', async (page) => {
    const fileUrl = `file://${path.resolve('demo-video', 'scene_02_scenario.html').replace(/\\/g, '/')}`;
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    // Smooth hover across the three family cards
    await page.mouse.move(450, 480);
    await page.waitForTimeout(4000);
    await page.mouse.move(960, 480);
    await page.waitForTimeout(4000);
    await page.mouse.move(1470, 480);
    await page.waitForTimeout(5000);
  });

  // SCENE 03: Landing Page & Core Philosophy
  await recordScene('scene_03', async (page) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Scroll through live preview and pillars
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    const launchBtn = page.locator('a:has-text("Launch Dashboard"), button:has-text("Launch Dashboard")').first();
    if (await launchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await launchBtn.hover();
      await page.waitForTimeout(2000);
    }
  });

  // SCENE 04: Overview Dashboard
  await recordScene('scene_04', async (page) => {
    await page.goto(`${BASE_URL}/overview`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(4000);
    // Hover on AQI 139 hero card
    await page.mouse.move(450, 320);
    await page.waitForTimeout(5000);
    // Hover on 3D atmospheric column
    await page.mouse.move(1200, 380);
    await page.waitForTimeout(6000);
    // Scroll down to telemetry strip
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 05: Live Air Intelligence
  await recordScene('scene_05', async (page) => {
    await page.goto(`${BASE_URL}/live`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Inspect criteria pollutants
    await page.mouse.move(600, 350);
    await page.waitForTimeout(4000);
    // Click location selector button in header
    const locBtn = page.locator('header button:has-text("Bengaluru"), header button:has-text("Location")').first();
    if (await locBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locBtn.click();
      console.log('Opened location selector dialog');
      await page.waitForTimeout(2000);
      const delhiOpt = page.locator('button:has-text("Delhi"), text=Delhi').first();
      if (await delhiOpt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await delhiOpt.click();
        console.log('Selected Delhi-NCR');
        await page.waitForTimeout(5000);
      }
    }
    // Switch back to Bengaluru
    if (await locBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locBtn.click();
      await page.waitForTimeout(1500);
      const blrOpt = page.locator('button:has-text("Bengaluru"), text=Bengaluru').first();
      if (await blrOpt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await blrOpt.click();
        console.log('Switched back to Bengaluru');
        await page.waitForTimeout(3000);
      }
    }
  });

  // SCENE 06: Pollution Forecast & Lapse Rates
  await recordScene('scene_06', async (page) => {
    await page.goto(`${BASE_URL}/forecast`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Hover on 48h curve
    await page.mouse.move(700, 320);
    await page.waitForTimeout(5000);
    // Scroll to Backtest Calibration panel
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 07: Family Protection & Inhaled Dose
  await recordScene('scene_07', async (page) => {
    await page.goto(`${BASE_URL}/family`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Hover over family member profiles
    await page.mouse.move(450, 360);
    await page.waitForTimeout(4000);
    await page.mouse.move(850, 360);
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
  });

  // SCENE 08: Indoor Air Advisor & Mass Balance
  await recordScene('scene_08', async (page) => {
    await page.goto(`${BASE_URL}/indoor`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // 3D room cutaway and green decision badge
    await page.mouse.move(800, 380);
    await page.waitForTimeout(5000);
    // Scroll to CADR purifier calculator and Corsi-Rosenthal blueprints
    await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
  });

  // SCENE 09: What-If Simulator & Impact Receipts
  await recordScene('scene_09', async (page) => {
    await page.goto(`${BASE_URL}/what-if`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Select Metro transit button
    const metroBtn = page.locator('button:has-text("Metro"), button:has-text("Electric")').first();
    if (await metroBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await metroBtn.click();
      console.log('Selected Metro Transit in What-If');
      await page.waitForTimeout(3000);
    }
    // Click View Impact Receipt button (legitimate dialog remains fully operational!)
    const receiptBtn = page.locator('button:has-text("Impact Receipt"), text=Impact Receipt').first();
    if (await receiptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await receiptBtn.click();
      console.log('Opened Impact Receipt modal');
      await page.waitForTimeout(5000);
      // Close receipt
      const closeBtn = page.locator('button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  // SCENE 10: Drone Lab & Hardware Honesty
  await recordScene('scene_10', async (page) => {
    await page.goto(`${BASE_URL}/drone`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Hover on NOT CONNECTED banner
    await page.mouse.move(400, 240);
    await page.waitForTimeout(3000);
    // Click Launch Flight Demonstration
    const demoBtn = page.locator('button:has-text("Simulated"), button:has-text("Demo"), button:has-text("Launch")').first();
    if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoBtn.click();
      console.log('Launched Simulated Flight Demonstration');
      await page.waitForTimeout(6000);
    }
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
  });

  // SCENE 11: Community Hub & Decision Score
  await recordScene('scene_11', async (page) => {
    await page.goto(`${BASE_URL}/community`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Inspect Decision Score gauge
    await page.mouse.move(500, 320);
    await page.waitForTimeout(4000);
    // Scroll to Sectoral Action Plans
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
  });

  // SCENE 12: AI Copilot
  await recordScene('scene_12', async (page) => {
    await page.goto(`${BASE_URL}/copilot`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    const inputArea = page.locator('input[type="text"], textarea').first();
    if (await inputArea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputArea.fill('What precautions should a family in Bengaluru take based on the current air-quality conditions?');
      await page.waitForTimeout(1500);
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
      if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sendBtn.click();
        console.log('Submitted question to AI Copilot');
        // Wait for real response to arrive and render completely
        await page.waitForTimeout(7000);
      }
    }
    // Highlight completed response
    await page.mouse.move(600, 480);
    await page.waitForTimeout(8000);
  });

  // SCENE 13: Clean-Air Daily Planner
  await recordScene('scene_13', async (page) => {
    await page.goto(`${BASE_URL}/planner`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Scroll through 24-hour routine
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
  });

  // SCENE 14: Spatial Radar Map
  await recordScene('scene_14', async (page) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfPresent(page);
    await page.waitForTimeout(3000);
    // Click Filter Pills: Stations, Thermal Points, All
    const stationsPill = page.locator('button:has-text("Stations")').first();
    if (await stationsPill.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stationsPill.click();
      console.log('Clicked Stations Filter Pill');
      await page.waitForTimeout(2500);
    }
    const firesPill = page.locator('button:has-text("Thermal"), button:has-text("Fires")').first();
    if (await firesPill.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firesPill.click();
      console.log('Clicked Thermal Points Filter Pill');
      await page.waitForTimeout(2500);
    }
    const allPill = page.locator('button:has-text("All")').first();
    if (await allPill.isVisible({ timeout: 2000 }).catch(() => false)) {
      await allPill.click();
      console.log('Clicked All Filter Pill');
      await page.waitForTimeout(2500);
    }
    // Hover on radar center and wind vector
    await page.mouse.move(700, 450);
    await page.waitForTimeout(4000);
  });

  // SCENE 15: Architecture & Project Outro
  await recordScene('scene_15', async (page) => {
    // Part 1: Show Architecture SVG diagram
    const archUrl = `${BASE_URL}/architecture/architecture.svg`;
    await page.goto(archUrl, { waitUntil: 'load' });
    await page.waitForTimeout(18000);
    // Part 2: Transition to Conclusion Outro Card
    const outroUrl = `file://${path.resolve('demo-video', 'scene_15_outro.html').replace(/\\/g, '/')}`;
    await page.goto(outroUrl, { waitUntil: 'load' });
    await page.waitForTimeout(15000);
  });

  console.log('\n======================================================');
  console.log('All 15 scene videos successfully captured in Full HD 1080p!');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
