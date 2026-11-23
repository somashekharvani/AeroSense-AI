const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const rawDir = path.resolve('demo-video', 'raw');
const durationsPath = path.resolve('demo-video', 'audio', 'durations.json');
const durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));

const BASE_URL = 'https://aero-sense-ai-psi.vercel.app';

async function recordSpecificScene(sceneId, runInteractions) {
  const targetDurationMs = Math.ceil(durations[`${sceneId}.wav`] * 1000);
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

  // Pre-seed localStorage to mark first visit complete
  await context.addInitScript(() => {
    try {
      localStorage.setItem('aerosense_has_visited', 'true');
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
    console.log(`Pacing wait for ${sceneId}: ${(remain / 1000).toFixed(1)}s`);
    await page.waitForTimeout(remain);
  }

  const tempVideoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalPath = path.join(rawDir, `${sceneId}.webm`);
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(tempVideoPath, finalPath);
  console.log(`Successfully updated ${sceneId} -> ${finalPath} (${(fs.statSync(finalPath).size / 1024).toFixed(0)} KB)`);
}

async function dismissModalIfAny(page) {
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    // If welcome modal exists, remove it immediately
    const modal = document.querySelector('div[role="dialog"]');
    if (modal) modal.remove();
  });
  await page.waitForTimeout(500);
}

async function main() {
  // SCENE 09: What-If Simulator
  await recordSpecificScene('scene_09', async (page) => {
    await page.goto(`${BASE_URL}/what-if`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissModalIfAny(page);

    // Hover on sliders and click Metro / Transit button
    await page.mouse.move(500, 380);
    await page.waitForTimeout(2000);
    const transitBtn = page.locator('button:has-text("Metro"), button:has-text("Electric"), button:has-text("Bus")').first();
    if (await transitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await transitBtn.click();
      console.log('Selected Transit Option');
      await page.waitForTimeout(2000);
    }
    // Expand Impact Receipt
    const receiptBtn = page.locator('button:has-text("Impact Receipt"), text=Impact Receipt').first();
    if (await receiptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await receiptBtn.click();
      console.log('Expanded Impact Receipt');
      await page.waitForTimeout(4000);
    }
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(4000);
  });

  // SCENE 10: Drone Lab
  await recordSpecificScene('scene_10', async (page) => {
    await page.goto(`${BASE_URL}/drone`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissModalIfAny(page);

    // Hover over NOT CONNECTED status banner
    await page.mouse.move(400, 240);
    await page.waitForTimeout(3000);

    // Click Launch Simulated Demo
    const demoBtn = page.locator('button:has-text("Simulated"), button:has-text("Demo"), button:has-text("Launch")').first();
    if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoBtn.click();
      console.log('Clicked Launch Flight Demo');
      await page.waitForTimeout(6000);
    }
    // Scroll to vertical profiling HUD
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  });

  // SCENE 12: AI Copilot
  await recordSpecificScene('scene_12', async (page) => {
    await page.goto(`${BASE_URL}/copilot`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissModalIfAny(page);

    const promptInput = page.locator('input[type="text"], textarea').first();
    if (await promptInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await promptInput.fill('Is it safe for Aarav to play outdoor soccer this afternoon in Bengaluru?');
      await page.waitForTimeout(2000);
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').first();
      if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sendBtn.click();
        console.log('Submitted Copilot question');
        await page.waitForTimeout(8000);
      }
    }
    await page.mouse.move(600, 500);
    await page.waitForTimeout(6000);
  });

  // SCENE 14: Pollution Map & Spatial Radar
  await recordSpecificScene('scene_14', async (page) => {
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissModalIfAny(page);

    // Click Filter Pills: Stations, Fires, All
    const stationsPill = page.locator('button:has-text("Stations")').first();
    if (await stationsPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stationsPill.click();
      console.log('Clicked Stations filter');
      await page.waitForTimeout(3000);
    }
    const firesPill = page.locator('button:has-text("Fires")').first();
    if (await firesPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firesPill.click();
      console.log('Clicked Fires filter');
      await page.waitForTimeout(3000);
    }
    const allPill = page.locator('button:has-text("All")').first();
    if (await allPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await allPill.click();
      console.log('Clicked All filter');
      await page.waitForTimeout(3000);
    }
    await page.mouse.move(700, 480);
    await page.waitForTimeout(6000);
  });

  console.log('\nAll targeted scenes successfully re-recorded with complete interactions!');
}

main().catch(err => {
  console.error('Re-recording failed:', err);
  process.exit(1);
});
