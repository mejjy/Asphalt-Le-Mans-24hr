import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[PAGE LOG ${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}\n${err.stack}`));

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Wait 4 seconds to observe loading and console output
  await page.waitForTimeout(4000);

  const startBtn = await page.$('#btn-welcome-start');
  const startText = await page.$eval('#welcome-start-text', el => el.textContent);
  const startKbd = await page.$eval('#welcome-enter-kbd', el => el.textContent);
  const progressFill = await page.$eval('#welcome-btn-progress-fill', el => el.style.width);
  console.log(`BUTTON STATE: text="${startText}", kbd="${startKbd}", progress="${progressFill}"`);

  await browser.close();
}

test().catch(err => console.error('Test failed:', err));
