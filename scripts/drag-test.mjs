import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: false, userDataDir:"/tmp/kalpana-chrome-profile",
  args:["--window-size=1456,900","--window-position=40,40","--no-first-run","--hide-scrollbars","--mute-audio"],
  defaultViewport:{width:1440,height:810,deviceScaleFactor:1}});
const p = await b.newPage();
await p.goto("http://localhost:3000", { waitUntil:"networkidle2", timeout:60000 });
await p.waitForFunction(()=>window.__kalpana && window.__frames>5, {timeout:45000, polling:250});
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>document.querySelector(".gate-choice-primary")?.click());
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>window.__kalpana.snap(2)); // meridian
await new Promise(r=>setTimeout(r,2600));
await p.evaluate(()=>window.__kalpana.render(4));
await new Promise(r=>setTimeout(r,400));
await p.screenshot({ path:"/tmp/kalpana-shots/drag-before.png" });
// synth drag: pointerdown on canvas, move right+down, up
await p.evaluate(()=>{
  const c=document.querySelector("canvas");
  const r=c.getBoundingClientRect(); const cx=r.left+r.width*0.5, cy=r.top+r.height*0.5;
  c.dispatchEvent(new PointerEvent("pointerdown",{clientX:cx,clientY:cy,button:0,bubbles:true}));
  for(let i=1;i<=12;i++){ window.dispatchEvent(new PointerEvent("pointermove",{clientX:cx+i*22,clientY:cy+i*6,bubbles:true})); }
  window.dispatchEvent(new PointerEvent("pointerup",{bubbles:true}));
});
await new Promise(r=>setTimeout(r,700));
await p.evaluate(()=>window.__kalpana.render(4));
await new Promise(r=>setTimeout(r,300));
await p.screenshot({ path:"/tmp/kalpana-shots/drag-after.png" });
await b.close(); console.log("drag test done");
