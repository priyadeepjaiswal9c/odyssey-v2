import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: false, userDataDir: "/tmp/kalpana-chrome-profile",
  args: ["--window-size=1456,900","--window-position=40,40","--no-first-run","--hide-scrollbars","--mute-audio"],
  defaultViewport: { width: 1440, height: 810, deviceScaleFactor: 1 } });
const p = await b.newPage();
await p.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 60000 });
await p.waitForFunction(() => window.__kalpana && window.__frames > 5, { timeout: 45000, polling: 250 });
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(() => document.querySelector(".gate-choice-primary")?.click()); // enter the world
await new Promise(r=>setTimeout(r,2500));
const ok = await p.evaluate(() => { const btns=[...document.querySelectorAll(".topbar-icon")]; const m=btns.find(b=>b.getAttribute("title")==="Night"); if(m){m.click();return true;} return false; });
console.log("night toggled:", ok);
await new Promise(r=>setTimeout(r,3000)); // let the sky ease over
for (const [i,name] of [[0,"night-hub"],[7,"night-contact"]]) {
  await p.evaluate((idx) => window.__kalpana.snap(idx), i);
  await new Promise(r=>setTimeout(r,2600));
  await p.evaluate(() => window.__kalpana.render(6));
  await new Promise(r=>setTimeout(r,500));
  await p.evaluate(() => window.__kalpana.render(6));
  await p.screenshot({ path: `/tmp/kalpana-shots/${name}.png` });
  console.log("✓", name);
}
await b.close();
