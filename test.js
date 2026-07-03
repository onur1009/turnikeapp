import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:5173');
  await page.waitForSelector('button');
  
  // Bulunduğumuz ekranda KAYIP EŞYA butonunu bul
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('KAYIP EŞYA')) {
      console.log('Clicking KAYIP EŞYA...');
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }

  await browser.close();
})();
