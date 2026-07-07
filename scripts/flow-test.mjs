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
page.on("pageerror", (e) => errors.push(e.message.slice(0, 180)));
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: "/tmp/kalpana-shots/f1-gate.png" });
// wait for world boot behind the gate
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 60000, polling: 250 }).catch(() => console.log("(world still booting — gate covers it)"));
await page.click(".gate-enter");
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: "/tmp/kalpana-shots/f2-menu.png" });
await page.click(".mc-btn"); // Explore World
await new Promise((r) => setTimeout(r, 5500));
await page.screenshot({ path: "/tmp/kalpana-shots/f3-world.png" });
// snap to meridian showcase for the RTX check
console.log(await page.evaluate(() => window.__kalpana.snap(3)));
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => window.__kalpana.render(6));
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: "/tmp/kalpana-shots/f4-meridian.png" });
console.log("errors:", errors.slice(0, 6).join(" | ") || "none");
await browser.close();
