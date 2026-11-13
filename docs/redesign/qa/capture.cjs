// npm install --prefix <qa-tools> playwright-core lighthouse
// node capture.cjs <qa-tools> <before|after> <local URL>
const fs = require("node:fs/promises");
const path = require("node:path");
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");
async function run(){
 const [toolDir,phase,url] = process.argv.slice(2);
 if(!["before","after"].includes(phase)) throw Error("Select before or after");
 const requireTool=createRequire(path.resolve(toolDir,"package.json"));
 const {chromium}=requireTool("playwright-core");
 const out=path.resolve(__dirname,"../evidence",phase);
 await fs.mkdir(out,{recursive:true});
 const chrome=process.env.CHROME_PATH||"C:/Program Files/Google/Chrome/Application/chrome.exe";
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:["--remote-debugging-port=19247"]});
 try{
 const measures=[];
 for(const width of [390,768,1440]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:960},deviceScaleFactor:1});
 await page.goto(url,{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(out,"overview-"+width+".png"),fullPage:true,animations:"disabled"});
 const stats=await page.evaluate(()=>{const controls=Array.from(document.querySelectorAll("a,button,textarea,select,input,summary")).filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().right>0);
 return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,domNodes:document.querySelectorAll("*").length,svgNodes:document.querySelectorAll("svg *").length,primaryTop:Math.round(document.querySelector('button[type="submit"]').getBoundingClientRect().top),smallTargets:controls.map(e=>({text:(e.innerText||e.getAttribute("aria-label")||e.tagName).trim(),width:Math.round(e.getBoundingClientRect().width),height:Math.round(e.getBoundingClientRect().height)})).filter(e=>e.height<44||e.width<44)}});
 measures.push(stats);
 if(width===1440){for(const view of ["fact-check","ai-analysis","sources","risklab"]){await page.goto(url+"/#"+view);await page.waitForFunction(id=>document.querySelector('a[aria-current="page"]')?.getAttribute("href")==="#"+id,view);await page.waitForTimeout(800);await page.screenshot({path:path.join(out,view+".png"),fullPage:true,animations:"disabled"})}}
 await page.close();
 }
 await fs.writeFile(path.join(out,"layout.json"),JSON.stringify(measures,null,2));
 const {default:lighthouse}=await import(pathToFileURL(requireTool.resolve("lighthouse")).href);
 const run=await lighthouse(url,{port:19247,logLevel:"error",onlyCategories:["performance","accessibility","seo"],output:"json"});
 if(!run||run.lhr.runtimeError)throw Error(JSON.stringify(run?.lhr.runtimeError));
 const {lhr}=run;
 const data={version:lhr.lighthouseVersion,chrome:lhr.environment.hostUserAgent,formFactor:lhr.configSettings.formFactor,throttling:lhr.configSettings.throttling,fetchTime:lhr.fetchTime,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","total-byte-weight"].map(k=>[k,lhr.audits[k].numericValue])),failed:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.scoreDisplayMode==="binary").map(a=>({id:a.id,items:a.details?.items?.map(i=>i.node?.selector||i.url||i.explanation).filter(Boolean)}))};
 await fs.writeFile(path.join(out,"lighthouse.json"),JSON.stringify(data,null,2)); console.log(data.categories);
 }finally{await browser.close()}
}
run().catch(e=>{console.error(e);process.exitCode=1});

