const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function test() {
  const rawDir = path.resolve('demo-video', 'raw-test');
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

  console.log('Launching Edge browser...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: rawDir, size: { width: 1920, height: 1080 } }
  });

  const page = await context.newPage();
  console.log('Navigating to live app...');
  await page.goto('https://aero-sense-ai-psi.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log('Test recording successful!');
  console.log('Video saved to:', videoPath);
  console.log('Video file size:', fs.statSync(videoPath).size, 'bytes');
}

test().catch(err => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
