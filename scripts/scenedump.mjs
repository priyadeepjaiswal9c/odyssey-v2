import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1456,900", "--window-position=40,40", "--no-first-run", "--mute-audio"],
  defaultViewport: { width: 1440, height: 810 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000/?nopost&noenv", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 45000, polling: 250 });
console.log(await page.evaluate(() => window.__kalpana.snap(1)));
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => window.__kalpana.render(6));
console.log(await page.evaluate(() => window.__kalpana.scene()));
await page.screenshot({ path: "/tmp/kalpana-shots/dbg-before.png" });
console.log(await page.evaluate(() => window.__kalpana.cullOff()));
await page.evaluate(() => window.__kalpana.render(4));
await page.screenshot({ path: "/tmp/kalpana-shots/dbg-cullofff.png" });
console.log("done");
await browser.close();
