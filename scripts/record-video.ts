import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function clickBackdrop(page: import('playwright').Page) {
  // Click on the top-left corner of the backdrop (outside the centered modal)
  const backdrop = page.locator('[data-testid="detail-backdrop"]');
  if (await backdrop.isVisible({ timeout: 1000 }).catch(() => false)) {
    // Click at position that's definitely outside the modal (far left edge)
    await backdrop.click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(500);
  }
}

async function record() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: 'screenshots/',
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  console.log('Recording started...');

  // === 1. Main view ===
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(400);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, -150);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);
  console.log('1/10 Main view');

  // === 2. Feature tabs ===
  for (const tab of ['Upscale', 'Inpaint', 'Style Transfer', '2D to 3D', 'Text to Image']) {
    await page.locator('button', { hasText: tab }).click();
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(500);
  console.log('2/10 Feature tabs');

  // === 3. Image detail modal ===
  await page.locator('article').first().click();
  await page.waitForTimeout(2500);
  await clickBackdrop(page);
  // Verify modal is closed
  await page.waitForFunction(() => {
    return !document.querySelector('[data-testid="detail-backdrop"]');
  }, { timeout: 3000 }).catch(() => console.log('  Warning: backdrop still visible'));
  await page.waitForTimeout(500);
  console.log('3/10 Image detail modal');

  // === 4. Search ===
  await page.locator('button[aria-label="Search"]').click();
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="Search"]').type('cyberpunk', { delay: 80 });
  await page.waitForTimeout(1500);
  // Close: click the overlay div itself at the top-left corner
  await page.locator('[class*="overlay"]').first().click({ position: { x: 5, y: 5 }, force: true });
  await page.waitForTimeout(600);
  console.log('4/10 Search');

  // === 5. History ===
  await page.locator('button[aria-label="History"]').click();
  await page.waitForTimeout(2000);
  await page.locator('button[aria-label="Close history"]').click().catch(async () => {
    await page.keyboard.press('Escape');
  });
  await page.waitForTimeout(600);
  console.log('5/10 History');

  // === 6. Style Guide ===
  await page.locator('button[aria-label="Open style guide"]').click();
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  console.log('6/10 Style guide');

  // === 7. Model dropdown ===
  const modelBtn = page.locator('button', { hasText: /Stable Diffusion|FLUX|Midjourney/ }).first();
  await modelBtn.click();
  await page.waitForTimeout(1200);
  await page.mouse.click(700, 300);
  await page.waitForTimeout(600);
  console.log('7/10 Model dropdown');

  // === 8. Prompt input ===
  await page.locator('textarea').click({ force: true });
  await page.waitForTimeout(300);
  await page.locator('textarea').type('A cyberpunk city at sunset, neon lights, ultra detailed 8k', { delay: 25 });
  await page.waitForTimeout(800);
  console.log('8/10 Prompt');

  // === 9. Generate ===
  await page.locator('button[aria-label="Generate image"]').click({ force: true });
  console.log('9/10 Generating...');
  await page.waitForTimeout(5000);
  console.log('10/10 Complete');

  await page.waitForTimeout(2000);

  // Save video
  const videoPath = await page.video()?.path();
  await page.close();
  await context.close();
  await browser.close();

  if (videoPath) {
    const dest = path.join('screenshots', 'demo-walkthrough.webm');
    await new Promise((r) => setTimeout(r, 1000));
    fs.copyFileSync(videoPath, dest);
    console.log(`\nVideo saved: ${dest}`);
  }
}

record().catch(console.error);
