import { chromium } from 'playwright';

async function ensureClean(page: import('playwright').Page) {
  // Close any modals/overlays by pressing Escape multiple times
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // 1. Main view
  await page.screenshot({ path: 'screenshots/01-main-view.png' });
  console.log('1/10 Main view');

  // 2. Card click → detail modal
  const firstCard = page.locator('article').first();
  await firstCard.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/02-image-detail.png' });
  console.log('2/10 Image detail modal');
  // Close with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Search overlay (fresh page load to ensure clean state)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.click('button[aria-label="Search"]');
  await page.waitForTimeout(400);
  await page.locator('input[placeholder*="Search"]').fill('cyber');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/03-search.png' });
  console.log('3/10 Search overlay');

  // 4. History panel (reload for clean state)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.click('button[aria-label="History"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/04-history.png' });
  console.log('4/10 History panel');

  // 5. Style Guide (reload for clean state)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.click('button[aria-label="Open style guide"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/05-style-guide.png' });
  console.log('5/10 Style guide');

  // 6. Model dropdown (reload for clean state)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const modelBtn = page.locator('button', { hasText: 'Stable Diffusion XL' });
  await modelBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/06-model-dropdown.png' });
  console.log('6/10 Model dropdown');

  // 7. Prompt + generate (reload for clean state)
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const textarea = page.locator('textarea');
  await textarea.fill('A beautiful cyberpunk cityscape at sunset, neon lights, ultra detailed, 8k');
  await page.waitForTimeout(400);
  const generateBtn = page.locator('button[aria-label="Generate image"]');
  await generateBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/07-generating.png' });
  console.log('7/10 Generating');

  // 8. Wait for completion (toast)
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'screenshots/08-completed-toast.png' });
  console.log('8/10 Completed + toast');

  // 9. Inpaint tab
  const inpaintTab = page.locator('button', { hasText: 'Inpaint' });
  await inpaintTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/09-inpaint-tab.png' });
  console.log('9/10 Inpaint tab');

  // 10. 2D to 3D tab
  const tdTab = page.locator('button', { hasText: '2D to 3D' });
  await tdTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/10-2d-to-3d-tab.png' });
  console.log('10/10 2D to 3D tab');

  await browser.close();
  console.log('\nAll screenshots saved!');
}

capture().catch(console.error);
