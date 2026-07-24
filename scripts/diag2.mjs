import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-first-run"], defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto("http://localhost:3000/classic",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>document.getElementById("skills")?.scrollIntoView());
await new Promise(r=>setTimeout(r,2000));
const out = await p.evaluate(()=>{
  const lists=[...document.querySelectorAll(".cl-skill-list")];
  return lists.map(l=>{
    const r=l.getBoundingClientRect();
    // check the transform on the parent group (motion)
    const grp=l.closest(".cl-skillgroup");
    const gs=getComputedStyle(grp);
    return { text:l.textContent.slice(0,40), x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height), groupTransform:gs.transform, groupOpacity:gs.opacity };
  });
});
console.log(JSON.stringify(out,null,1));
await b.close();
