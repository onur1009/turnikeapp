const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173');
  
  // Wait for loading screen to finish
  console.log("Waiting for game to load...");
  await page.waitForSelector('.capsule', { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "Oyuna Başla" or just click the screen to bypass tutorial if there is one
  console.log("Clicking screen to start/bypass tutorial...");
  await page.mouse.click(100, 100);
  await new Promise(r => setTimeout(r, 1000));
  await page.mouse.click(100, 100);
  await new Promise(r => setTimeout(r, 1000));

  console.log("Looking for 'Oyuna Başla' or Play button on Home screen...");
  // Usually it's a button with text "OYUNA BAŞLA"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && text.includes('OYUNA BAŞLA')) {
      console.log("Found Oyuna Başla, clicking...");
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Playing level 1 by using hints...");
  // Find hint button (has text '✦' or 'lightbulb')
  for (let i = 0; i < 4; i++) {
    const hintBtns = await page.$$('button');
    for (const btn of hintBtns) {
      const html = await page.evaluate(el => el.innerHTML, btn);
      if (html.includes('lightbulb')) {
        await btn.click();
        console.log("Clicked Hint " + (i+1));
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
  }
  
  console.log("Waiting 5 seconds for end of level transition...");
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Checking if BonusLockers modal exists on screen...");
  const pageContent = await page.content();
  if (pageContent.includes('Kayıp Eşya Bürosu') || pageContent.includes('KAYIP EŞYA')) {
    console.log("SUCCESS! BonusLockers appeared on the game screen!");
  } else {
    console.log("FAILURE! BonusLockers did NOT appear!");
    console.log("Page snippet:", pageContent.substring(0, 500));
  }
  
  await browser.close();
})();
