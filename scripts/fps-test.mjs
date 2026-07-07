import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1456,900", "--window-position=40,40", "--no-first-run", "--mute-audio"],
  defaultViewport: { width: 1440, height: 810 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 60000, polling: 250 });
// measure at the busiest stops with the full live loop
for (const [i, name] of [[2, "warmup"], [8, "village"], [12, "hall"], [2, "meridian"], [4, "tark"]]) {
  await page.evaluate((idx) => window.__kalpana.snap(idx), i);
  await new Promise((r) => setTimeout(r, 2500)); // settle + realm build
  const fps = await page.evaluate(
    () =>
      new Promise((res) => {
        const start = window.__frames;
        const t0 = performance.now();
        setTimeout(() => res(((window.__frames - start) / (performance.now() - t0)) * 1000), 5000);
      })
  );
  console.log(`${name}: ${fps.toFixed(1)} fps`);
}
await browser.close();
