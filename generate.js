const fs = require('fs');
const puppeteer = require('puppeteer');
const { parseMegaMillions, parsePowerball } = require('./parser');

// Utility delay
const wait = ms => new Promise(res => setTimeout(res, ms));

(async () => {
const browser = await puppeteer.launch({
  headless: "new",
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
  const page = await browser.newPage();

  // --- Mega Millions ---
  console.log("Fetching Mega Millions...");
  await page.goto('https://www.megamillions.com/', { waitUntil: 'domcontentloaded' });

  try {
    await page.click('#simplemodal-close', { timeout: 3000 });
    console.log("✔ Popup closed");
  } catch {
    console.log("⚠ No popup found (that’s okay)");
  }

  await wait(3000); // wait for content to settle
  await page.evaluate(() => window.scrollBy(0, 200));
  await wait(2000); // wait again

  const megaText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('mega_raw.txt', megaText);
  console.log("✔ Saved mega_raw.txt");

  let megaParsed;
  try {
    megaParsed = parseMegaMillions(megaText);
    console.log("✔ Parsed Mega Millions");
  } catch (err) {
    console.log("❌ Mega Millions Parse Error:", err.message);
  }

  // --- Powerball ---
  console.log("Fetching Powerball...");
  await page.goto('https://www.powerball.com/', { waitUntil: 'domcontentloaded' });

  await wait(3000);
  const powerText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('power_raw.txt', powerText);
  console.log("✔ Saved power_raw.txt");

  let powerParsed;
  try {
    powerParsed = parsePowerball(powerText);
    console.log("✔ Parsed Powerball");
  } catch (err) {
    console.log("❌ Powerball Parse Error:", err.message);
  }

  await browser.close();

  if (megaParsed && powerParsed) {
    fs.writeFileSync('lottery.json', JSON.stringify({ megaMillions: megaParsed, powerball: powerParsed }, null, 2));
    console.log("✅ All data saved to lottery.json");
  } else {
    console.log("⚠ Some data was not parsed correctly. Check raw text files.");
  }
})();
