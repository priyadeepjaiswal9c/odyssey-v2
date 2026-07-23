import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args:["--no-first-run","--hide-scrollbars"], defaultViewport:{width:1440,height:900,deviceScaleFactor:1}});
const p = await b.newPage();
// DARK (default)
await p.goto("http://localhost:3000/classic", { waitUntil:"networkidle2", timeout:60000 });
await new Promise(r=>setTimeout(r,1600));
await p.screenshot({ path:"/tmp/kalpana-shots/classic-dark-top.png" });
await p.evaluate(()=>window.scrollTo(0,1500));
await new Promise(r=>setTimeout(r,900));
await p.screenshot({ path:"/tmp/kalpana-shots/classic-dark-mid.png" });
// toggle to LIGHT
await p.evaluate(()=>window.scrollTo(0,0));
await new Promise(r=>setTimeout(r,400));
await p.evaluate(()=>document.querySelector(".cl-theme-toggle")?.click());
await new Promise(r=>setTimeout(r,900));
await p.screenshot({ path:"/tmp/kalpana-shots/classic-light-top.png" });
await p.evaluate(()=>window.scrollTo(0,1500));
await new Promise(r=>setTimeout(r,900));
await p.screenshot({ path:"/tmp/kalpana-shots/classic-light-mid.png" });
await b.close();
console.log("classic dark+light shots done");
