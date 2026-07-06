import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=420,900", "--window-position=40,40", "--no-first-run", "--mute-audio"],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 45000, polling: 250 });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "/tmp/kalpana-shots/m1-menu.png" });
console.log(await page.evaluate(() => window.__kalpana.snap(4))); // a showcase stop
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => window.__kalpana.render(6));
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: "/tmp/kalpana-shots/m2-showcase.png" });
console.log("mobile shots done");
await browser.close();
