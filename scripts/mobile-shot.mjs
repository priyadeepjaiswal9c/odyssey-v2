import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-first-run","--hide-scrollbars"], defaultViewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}});
const p = await b.newPage();
// classic mobile
await p.goto("http://localhost:3000/classic",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,2000));
await p.screenshot({path:"/tmp/kalpana-shots/m-classic.png"});
await b.close(); console.log("mobile done");
