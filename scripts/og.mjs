import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1216,700", "--window-position=40,40", "--no-first-run", "--mute-audio"],
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 60000, polling: 250 });
console.log(await page.evaluate(() => window.__kalpana.snap(2)));
await new Promise((r) => setTimeout(r, 2200));
await page.evaluate(() => window.__kalpana.render(6));
// hide HUD chrome for a clean poster
await page.evaluate(() => {
  document.querySelectorAll(".hud, .fastlane").forEach((el) => (el.style.display = "none"));
});
await new Promise((r) => setTimeout(r, 300));
await page.evaluate(() => window.__kalpana.render(2));
await page.screenshot({ path: "public/og.png" });
console.log("og.png written");
await browser.close();
