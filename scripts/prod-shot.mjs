import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const U = "https://odyssey-v2-indol.vercel.app";
const b = await puppeteer.launch({ executablePath: CHROME, headless:false, userDataDir:"/tmp/kalpana-prod-profile", args:["--window-size=1456,900","--no-first-run","--hide-scrollbars","--mute-audio"], defaultViewport:{width:1440,height:810,deviceScaleFactor:1}});
const p = await b.newPage();
// home
await p.goto(U+"/", {waitUntil:"networkidle2", timeout:60000});
await new Promise(r=>setTimeout(r,2500));
await p.screenshot({path:"/tmp/kalpana-shots/prod-home.png"});
// enter world → hub
await p.evaluate(()=>document.querySelector(".gate-choice-primary")?.click());
await new Promise(r=>setTimeout(r,6000)); // enter flight + settle
await p.screenshot({path:"/tmp/kalpana-shots/prod-world.png"});
// classic
await p.goto(U+"/classic", {waitUntil:"networkidle2", timeout:60000});
await new Promise(r=>setTimeout(r,2500));
await p.screenshot({path:"/tmp/kalpana-shots/prod-classic.png"});
await b.close(); console.log("prod shots done");
