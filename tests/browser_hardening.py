import asyncio,json,pathlib,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1];URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000');results=[]
def check(name,value):
 assert value,name
 results.append({'name':name,'passed':True});print('PASS',name,flush=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',service_workers='block');page=await ctx.new_page()
  await page.goto(URL+'/#overview',wait_until='networkidle')
  hotspot=page.locator('svg.body-atlas [role=button][aria-label^="Respiratory:"]').last;await hotspot.focus();await page.keyboard.press('Space');check('Anatomy hotspots support keyboard selection',await page.locator('.system-detail h3').inner_text()=='Respiratory')
  trigger=page.get_by_role('button',name='Log a reading',exact=True).first;await trigger.click();await page.keyboard.press('Escape');check('Dialog closing restores focus to its trigger',await trigger.evaluate('(el)=>el===document.activeElement'))
  await page.keyboard.press('Control+k');await page.locator('dialog').get_by_role('textbox',name='Find a view',exact=True).fill('trends');await page.locator('dialog').get_by_role('button',name='Trends & baselines',exact=True).click();check('Keyboard command search navigates to a real view','#trends' in page.url)
  chart=page.locator('.chart-wrap svg');await chart.focus();await page.keyboard.press('ArrowRight');check('Arrow keys expose exact chart observations','FD 133' in await page.locator('.chart-readout').inner_text());await page.get_by_text('View accessible data table',exact=True).click();check('Chart has a readable tabular alternative',await page.locator('.chart-table tbody tr').count()==14)
  await page.goto(URL+'/#logbook');await page.get_by_role('button',name='Next',exact=True).click();await page.get_by_role('button',name='Next',exact=True).click();await page.get_by_label('Data workspace',exact=True).select_option('local');check('Pagination remains valid after switching to an empty workspace','Start with one consistent reading' in await page.locator('main').inner_text())
  await page.goto(URL+'/#settings');await page.get_by_role('checkbox',name='Reduce motion',exact=False).check();await page.reload(wait_until='networkidle');check('Reduced-motion preference persists',await page.evaluate('document.documentElement.dataset.motion')=='reduced')
  other=await ctx.new_page();await other.goto(URL+'/#overview');await other.get_by_role('button',name='Log a reading',exact=True).click();dialog=other.locator('dialog');await dialog.get_by_role('combobox',name='Health indicator',exact=True).select_option('hr');await dialog.get_by_role('spinbutton',name='Measured value',exact=True).fill('61');await dialog.get_by_role('button',name='Save on device',exact=True).click();await page.wait_for_function('document.querySelector(".storage-stats").textContent.includes("1local readings")');check('Workspace updates propagate to another browser tab',await page.locator('.storage-stats strong').first.inner_text()=='1\nlocal readings');await other.close()
  await page.route('**/api/feeds*',lambda r:r.fulfill(status=200,content_type='application/json',body='{"status":"live","data":{"wrong":"shape"}}'))
  await page.goto(URL+'/#evidence',wait_until='networkidle');await page.get_by_text('Network refresh unavailable. Displaying the bundled, dated snapshot.',exact=True).wait_for();check('Malformed successful API response falls back safely',await page.locator('.study-card').count()==2);await page.unroute('**/api/feeds*')
  await page.route('**/data/osd575-submitted.csv',lambda r:r.fulfill(status=200,content_type='text/csv',body=(ROOT/'public/data/osd575-submitted.csv').read_text().replace('GLUCOSE,83','GLUCOSE,84',1)))
  await page.reload(wait_until='networkidle');await page.get_by_text('Archive checksum mismatch. Analysis blocked; restore the verified source file.',exact=True).wait_for();check('Tampered NASA bytes block archive analysis',await page.locator('.archive-chart').count()==0);await page.unroute('**/data/osd575-submitted.csv')
  await page.set_viewport_size({'width':390,'height':844});await page.goto(URL+'/#overview');check('Closed mobile navigation cannot receive focus',await page.locator('.sidebar').evaluate('(el)=>getComputedStyle(el).visibility')=='hidden')
  await page.get_by_role('button',name='Toggle navigation',exact=True).click();check('Open mobile menu makes background inert',await page.locator('.workspace').evaluate('(el)=>el.inert'))
  close=page.get_by_role('button',name='Close menu',exact=True);await close.focus();await page.keyboard.press('Shift+Tab');check('Mobile navigation traps reverse tab at its last control',await page.get_by_role('button',name='About & methodology',exact=False).evaluate('(el)=>el===document.activeElement'))
  await page.keyboard.press('Escape');check('Escape closes the navigation and restores focus',await page.get_by_role('button',name='Toggle navigation',exact=True).evaluate('(el)=>el===document.activeElement'))
  for route in ['overview','atlas','logbook','trends','actions','evidence','environment','replay','handover','settings','about']:
   await page.goto(URL+'/#'+route,wait_until='networkidle');await page.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'));violations=await page.evaluate('async()=> (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))');print('Violations:',violations,flush=True) if violations else None;check('Mobile axe scan: '+route,not violations)
  await page.set_viewport_size({'width':320,'height':720})
  for route in ['overview','atlas','logbook','trends','actions','evidence','environment','replay','handover','settings','about']:
   await page.goto(URL+'/#'+route,wait_until='networkidle');check('320px layout: '+route,await page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  await b.close()
 (ROOT/'docs/test-results/browser-hardening.json').write_text(json.dumps({'checks':len(results),'results':results},indent=2))
try:asyncio.run(main())
except BaseException:
 (ROOT/'docs/test-results/browser-hardening-partial.json').write_text(json.dumps(results,indent=2))

 raise
