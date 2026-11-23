const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const rawDir = path.resolve('demo-video', 'raw-v2');
const durationsPath = path.resolve('demo-video', 'audio-v2', 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

const BASE_URL = 'https://aero-sense-ai-psi.vercel.app';

async function naturalHoldWithMotion(page, durationMs) {
  const start = Date.now();
  let x = 800, y = 450;
  while (Date.now() - start < durationMs) {
    x = 800 + Math.sin((Date.now() - start) / 1000) * 150;
    y = 450 + Math.cos((Date.now() - start) / 1000) * 50;
    await page.mouse.move(x, y);
    await page.waitForTimeout(300);
  }
}

async function recordSpecificScene(sceneId, runInteractions) {
  const targetDurationMs = Math.ceil(durations[`${sceneId}.mp3`] * 1000);
  console.log(`\n======================================================`);
  console.log(`Re-recording ${sceneId} (Target duration: ${(targetDurationMs / 1000).toFixed(1)}s)...`);
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

  const elapsed = Date.now() - startTime;
  if (elapsed < targetDurationMs) {
    const remain = targetDurationMs - elapsed;
    console.log(`Pacing hold with motion for ${sceneId}: ${(remain / 1000).toFixed(1)}s`);
    await naturalHoldWithMotion(page, remain);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  const tempVideoPath = await video.path();
  const finalPath = path.join(rawDir, `${sceneId}.webm`);
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(tempVideoPath, finalPath);
  console.log(`✓ Completed ${sceneId} -> ${finalPath} (${(fs.statSync(finalPath).size / 1024).toFixed(0)} KB)`);
}

async function main() {
  // SCENE 06: Pollution Forecast & Lapse Rates
  await recordSpecificScene('scene_06', async (page) => {
    await page.goto(`${BASE_URL}/forecast`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Smooth hover across 48h curve
    for (let x = 400; x <= 1200; x += 150) {
      await page.mouse.move(x, 380);
      await page.waitForTimeout(800);
    }
    // Scroll down to Backtest Calibration panel
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    for (let x = 500; x <= 1100; x += 150) {
      await page.mouse.move(x, 480);
      await page.waitForTimeout(800);
    }
  });

  // SCENE 07: Family Protection & Inhaled Dose
  await recordSpecificScene('scene_07', async (page) => {
    await page.goto(`${BASE_URL}/family`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Hover across Aarav, Priya, and Grandfather profile cards
    await page.mouse.move(450, 360);
    await page.waitForTimeout(4000);
    await page.mouse.move(850, 360);
    await page.waitForTimeout(4000);
    await page.mouse.move(1250, 360);
    await page.waitForTimeout(4000);
    // Scroll down to Inhaled Dose calculations
    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    for (let x = 450; x <= 1250; x += 200) {
      await page.mouse.move(x, 500);
      await page.waitForTimeout(1000);
    }
  });

  console.log('\nScenes 06 and 07 re-recorded successfully with full duration!');
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
