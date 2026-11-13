import asyncio,json,pathlib,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/test-results'
OUT.mkdir(parents=True, exist_ok=True)
URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000')
async def main():
 results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1440,'height':1050},reduced_motion='reduce');page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(URL,wait_until='networkidle');await page.evaluate('navigator.serviceWorker.ready');await page.wait_for_function('!!navigator.serviceWorker.controller')
  for route in ['overview','atlas','logbook','trends','actions','evidence','environment','replay','handover','judges','settings','about']:
   await page.goto(URL+'/#'+route,wait_until='networkidle');await page.wait_for_timeout(300)
   await page.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
   a=await page.evaluate('async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,15)}));}')
   overflow=await page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth')
   r={'route':route,'violations':a,'overflow':overflow,'errors':list(errors),'h1':await page.locator('h1').inner_text()};results.append(r)
   if route in ['overview','atlas','evidence','environment']:await page.screenshot(path=str(ROOT/f'docs/screenshots/{route}-desktop.png'),full_page=True)
   print(route,'a11y',len(a),'overflow',overflow,'errors',len(errors),flush=True)
  await page.set_viewport_size({'width':390,'height':844})
  for route in ['overview','atlas','logbook','trends','actions','evidence','environment','replay','handover','judges','settings','about']:
   await page.goto(URL+'/#'+route,wait_until='networkidle')
   overflow=await page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth')
   results.append({'route':route,'viewport':390,'overflow':overflow,'errors':list(errors)})
   if route in ['overview','evidence']:await page.screenshot(path=str(ROOT/f'docs/screenshots/{route}-mobile.png'),full_page=True)
   print('mobile',route,'overflow',overflow,flush=True)
  await b.close()
 (ROOT/'docs/test-results/browser-sweep.json').write_text(json.dumps(results,indent=2))
 if any(r.get('violations') or r.get('overflow') or r.get('errors') for r in results):raise AssertionError('Browser sweep detected a violation; see the JSON report.')
asyncio.run(main())
