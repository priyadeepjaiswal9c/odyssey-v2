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
await new Promise((r) => setTimeout(r, 2500));
const fonts = await page.evaluate(() => ({
  gateName: getComputedStyle(document.querySelector(".gate-name")).fontFamily.slice(0, 60),
  body: getComputedStyle(document.body).fontFamily.slice(0, 60),
  monocraftLoaded: document.fonts.check("16px Monocraft") || [...document.fonts].some(f => f.family.includes("Monocraft") && f.status === "loaded"),
}));
console.log(JSON.stringify(fonts, null, 1));
await page.screenshot({ path: "/tmp/kalpana-shots/f1-gate.png" });
await browser.close();
