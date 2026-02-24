import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  // 1. Main view - masonry gallery
  await page.screenshot({ path: 'screenshots/01-main-view.png' });
  console.log('1/8 Main view');

  // 2. Card hover
  const firstCard = page.locator('article').first();
  await firstCard.hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/02-card-hover.png' });
  console.log('2/8 Card hover');

  // 3. Style Guide Modal
  await page.click('button[aria-label="Open style guide"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/03-style-guide-modal.png' });
  console.log('3/8 Style Guide modal');
  await page.click('button[aria-label="Close"]');
  await page.waitForTimeout(300);

  // 4. Model dropdown
  const modelBtn = page.locator('button', { hasText: 'Stable Diffusion XL' });
  await modelBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/04-model-dropdown.png' });
  console.log('4/8 Model dropdown');
  await page.mouse.click(700, 400);
  await page.waitForTimeout(200);

  // 5. Type prompt
  const textarea = page.locator('textarea');
  await textarea.fill('A beautiful cyberpunk cityscape at sunset, neon lights, ultra detailed, 8k');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/05-prompt-entered.png' });
  console.log('5/8 Prompt entered');

  // 6. Generate (progress bar)
  const generateBtn = page.locator('button[aria-label="Generate image"]');
  await generateBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshots/06-generating.png' });
  console.log('6/8 Generating');

  // 7. Wait for completion
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/07-completed.png' });
  console.log('7/8 Completed');

  // 8. Switch to empty tab
  const inpaintTab = page.locator('button', { hasText: 'Inpaint' });
  await inpaintTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/08-empty-tab.png' });
  console.log('8/8 Empty tab');

  await browser.close();
  console.log('\nAll screenshots saved!');
}

capture().catch(console.error);
