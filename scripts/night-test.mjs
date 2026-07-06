import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1456,900", "--window-position=40,40", "--no-first-run", "--mute-audio"],
  defaultViewport: { width: 1440, height: 810 },
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 200)));
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 45000, polling: 250 });
// snap to hub shrine, then flip night via the store through the UI path
console.log(await page.evaluate(() => window.__kalpana.snap(1)));
await new Promise((r) => setTimeout(r, 1500));
await page.evaluate(() => window.__kalpana.render(4));
await page.screenshot({ path: "/tmp/kalpana-shots/n1-day.png" });
// enter world phase already set by snap; click the night toggle
await page.click('button[title="Night"]');
await new Promise((r) => setTimeout(r, 2600)); // let the lerp settle (live RAF)
await page.screenshot({ path: "/tmp/kalpana-shots/n2-night.png" });
// meridian at night (power lines should sing)
console.log(await page.evaluate(() => window.__kalpana.snap(3)));
await new Promise((r) => setTimeout(r, 1800));
await page.evaluate(() => window.__kalpana.render(6));
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "/tmp/kalpana-shots/n3-meridian-night.png" });
console.log("pageerrors:", errors.slice(0, 5).join(" | ") || "none");
await browser.close();
