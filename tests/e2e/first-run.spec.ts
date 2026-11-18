import { test, expect } from '@playwright/test';

test.describe('AeroSense AI - Phase 1 Foundation E2E', () => {
  test('First-run onboarding, language switching (Hindi & Urdu RTL), and location picker', async ({
    page,
  }) => {
    // Navigate to root
    await page.goto('/');

    // 1. Verify Welcome Modal appears on first visit
    const welcomeHeading = page.locator('#welcome-heading');
    await expect(welcomeHeading).toBeVisible({ timeout: 10000 });

    // Step 1: Select Hindi from grid
    const hindiOption = page.getByRole('button', { name: /हिन्दी/i });
    await expect(hindiOption).toBeVisible();
    await hindiOption.click();

    // Verify DOM lang switches to Hindi
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

    // Click Continue to Step 2
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await continueBtn.click();

    // Step 2: Choose Bengaluru preset city
    const bengaluruPreset = page.getByRole('button', { name: /Bengaluru/i });
    await expect(bengaluruPreset).toBeVisible();
    await bengaluruPreset.click();

    // Click "Enter AeroSense AI" / "एयरोसेंस एआई में प्रवेश करें"
    const getStartedBtn = page.getByRole('button', { name: /एयरोसेंस एआई में प्रवेश करें|Enter AeroSense AI/i });
    await getStartedBtn.click();

    // Welcome modal should close
    await expect(welcomeHeading).not.toBeVisible();

    // 2. Verify URL contains ?lat= and ?lon= and ?lang=
    await expect(page).toHaveURL(/lat=12\.97/);
    await expect(page).toHaveURL(/lon=77\.59/);
    await expect(page).toHaveURL(/lang=hi/);

    // 3. Switch Language to Urdu (RTL test)
    const langBtn = page.getByRole('button', { name: /हिन्दी/i });
    await langBtn.click();

    const urduOption = page.getByRole('menuitem', { name: /اردو/i });
    await expect(urduOption).toBeVisible();
    await urduOption.click();

    // Verify DOM lang is 'ur' and dir is 'rtl'
    await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // 4. Open Location Dialog from Header chip
    const locationChip = page.locator('header button').filter({ hasText: /Bengaluru|12\.97/i }).first();
    await locationChip.click();

    // Expect Location dialog to open
    const locationModal = page.getByRole('dialog');
    await expect(locationModal).toBeVisible();

    // Switch to Presets tab and pick Delhi
    const presetsTab = page.getByRole('tab', { name: /مشہور شہر|Popular Cities/i });
    await presetsTab.click();

    const delhiPreset = page.getByRole('button', { name: /Delhi/i }).first();
    await delhiPreset.click();

    // URL should update to Delhi coordinates (28.61, 77.21)
    await expect(page).toHaveURL(/lat=28\.61/);
    await expect(page).toHaveURL(/lon=77\.21/);
  });
});
