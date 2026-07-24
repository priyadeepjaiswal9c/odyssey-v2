import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args:["--no-first-run"], defaultViewport:{width:1440,height:900}});
const p = await b.newPage();
await p.goto("http://localhost:3000/classic", { waitUntil:"networkidle2", timeout:60000 });
await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>document.getElementById("skills")?.scrollIntoView());
await new Promise(r=>setTimeout(r,1800));
const info = await p.evaluate(()=>{
  const groups = document.querySelector(".cl-skillgroups");
  const gs = getComputedStyle(groups);
  const items = [...document.querySelectorAll(".cl-skillgroup")].slice(0,3).map(el=>{
    const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
    const list = el.querySelector(".cl-skill-list");
    const lr = list.getBoundingClientRect(); const ls = getComputedStyle(list);
    return { itemLeft:Math.round(r.left), itemW:Math.round(r.width), itemMinW:cs.minWidth, listW:Math.round(lr.width), listWS:ls.whiteSpace, listDisplay:ls.display };
  });
  return { display:gs.display, cols:gs.gridTemplateColumns, groupsW:Math.round(groups.getBoundingClientRect().width), items };
});
console.log(JSON.stringify(info,null,1));
await b.close();
