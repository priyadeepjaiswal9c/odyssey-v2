import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args:["--no-first-run","--hide-scrollbars"], defaultViewport:{width:1440,height:900,deviceScaleFactor:1}});
const p = await b.newPage();
const shot = (n)=>p.screenshot({path:`/tmp/kalpana-shots/${n}.png`});
const to = async (y)=>{ await p.evaluate((y)=>window.scrollTo(0,y), y); await new Promise(r=>setTimeout(r,1300)); };
await p.goto("http://localhost:3000/classic", { waitUntil:"networkidle2", timeout:60000 });
await new Promise(r=>setTimeout(r,2000)); // hero page-load anim
await shot("classic-dark-top");
await to(760); await shot("classic-dark-skills");
await to(1700); await shot("classic-dark-projects");
await p.evaluate(()=>document.getElementById("achievements")?.scrollIntoView()); await new Promise(r=>setTimeout(r,1300)); await shot("classic-dark-awards");
// LIGHT
await p.evaluate(()=>window.scrollTo(0,0)); await new Promise(r=>setTimeout(r,700));
await p.evaluate(()=>document.querySelector(".cl-theme-toggle")?.click()); await new Promise(r=>setTimeout(r,800));
await shot("classic-light-top");
await to(760); await shot("classic-light-skills");
await b.close(); console.log("shots done");
