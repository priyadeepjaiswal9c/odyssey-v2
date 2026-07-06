import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1456,900", "--window-position=40,40", "--no-first-run", "--mute-audio", "--autoplay-policy=no-user-gesture-required"],
  defaultViewport: { width: 1440, height: 810 },
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message.slice(0, 200)));
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 45000, polling: 250 });
await new Promise((r) => setTimeout(r, 1500));
await page.click(".mc-btn");
console.log("clicked Explore World");
await new Promise((r) => setTimeout(r, 4500));
await page.screenshot({ path: "/tmp/kalpana-shots/t1-entered.png" });
await new Promise((r) => setTimeout(r, 6500));
await page.screenshot({ path: "/tmp/kalpana-shots/t2-touring.png" });
await new Promise((r) => setTimeout(r, 9000));
await page.screenshot({ path: "/tmp/kalpana-shots/t3-projects.png" });
console.log("errs:", (await page.evaluate(() => (window.__errs || []).slice(0, 6))).join(" | ") || "none", "| pageerrors:", errors.slice(0, 5).join(" | ") || "none");
await browser.close();
