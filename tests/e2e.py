"""Executable browser workflow checks. Requires: pip install playwright; playwright install chromium."""
import asyncio,json,pathlib,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1];URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000');results=[]
def check(name,value,detail=''):
 assert value, f'{name}: {detail}'
 results.append({'name':name,'passed':True,'detail':detail});print('PASS',name,flush=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch();ctx=await browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,reduced_motion='reduce');page=await ctx.new_page();errors=[];posts=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:posts.append(r.url) if r.method=='POST' else None)
  async def go(route):
   await page.goto(URL+'/#'+route,wait_until='networkidle')
  async def stored():return await page.evaluate('JSON.parse(localStorage.getItem("prohor.v3.workspace"))')
  async def openlog():
   await page.get_by_role('button',name='Log a reading',exact=True).first.click()
   await page.locator('dialog[open]').wait_for()
  await go('overview');await page.evaluate('navigator.serviceWorker.ready');await page.wait_for_function('!!navigator.serviceWorker.controller')
  check('Production service worker controls the page',await page.evaluate('!!navigator.serviceWorker.controller'))
  check('Default view labels the simulation',await page.get_by_text('Generated crew readings. Not real astronaut records.',exact=True).is_visible())
  check('Known five-signal fixture detected','5 indicators to review' in await page.locator('main').inner_text())
  await page.locator('.system-item').filter(has_text='Cardiovascular').click()
  check('Body selection changes detail',await page.locator('.system-detail h3').inner_text()=='Cardiovascular')
  await page.get_by_role('button',name='Skeleton',exact=True).click();check('Skeleton layer is functional',await page.locator('.skeleton-view').count()==1)
  await page.get_by_role('button',name='Anatomy',exact=True).click()
  await page.get_by_label('Crew profile',exact=True).select_option('MS-02');check('Partial sensor profile is honest','Building baseline' in await page.locator('.system-detail').inner_text())
  await page.get_by_label('Crew profile',exact=True).select_option('CDR-01');await page.get_by_label('Flight day',exact=True).select_option('142');check('Nominal scenario has no flags','No rule-level changes' in await page.locator('main').inner_text())
  await page.get_by_label('Flight day',exact=True).select_option('146')
  await openlog();await page.keyboard.press('Escape');check('Escape closes the modal',await page.locator('dialog[open]').count()==0)
  await openlog();dialog=page.locator('dialog');await dialog.get_by_role('combobox',name='Health indicator',exact=True).select_option('hr');await dialog.get_by_label('Measured value',exact=True).fill('900');await dialog.get_by_role('button',name='Save on device',exact=True).click();check('Impossible values are rejected','Outside the supported input range' in await dialog.inner_text());check('Rejected reading does not persist',len((await stored())['readings'])==0)
  await dialog.get_by_role('combobox',name='Health indicator',exact=True).select_option('sleep');await dialog.get_by_role('combobox',name='Unit',exact=True).select_option('min');await dialog.get_by_label('Measured value',exact=True).fill('420');await dialog.get_by_label('Flight day',exact=True).fill('141');await dialog.get_by_role('button',name='Save on device',exact=True).click();await page.locator('dialog').wait_for(state='detached')
  s=await stored();check('Saving switches to the separate local workspace',s['settings']['mode']=='local');check('Canonical and original units persist',s['readings'][0]['value']==7 and s['readings'][0]['sourceValue']==420 and s['readings'][0]['sourceUnit']=='min')
  await page.reload(wait_until='networkidle');check('Local readings survive reload',len((await stored())['readings'])==1);check('Fresh local workspace does not inherit a baseline','Building baseline' in await page.locator('main').inner_text())
  await openlog();await page.locator('dialog').get_by_role('button',name='Daily check-in',exact=True).click();await page.get_by_role('combobox',name='Mood · 1 low → 5 good',exact=True).select_option('3');await page.get_by_role('combobox',name='Fatigue · 1 low → 5 high',exact=True).select_option('2');await page.locator('dialog textarea').fill('<img src=x onerror=alert(1)>');await page.locator('dialog').get_by_role('button',name='Save on device',exact=True).click();await page.locator('dialog').wait_for(state='detached');check('Optional check-in saves only selected fields',len((await stored())['readings'])==3)
  await go('logbook');check('Notes are rendered as text, not executable HTML',await page.locator('main img[src=x]').count()==0)
  await go('settings');bad='day,signal,value,unit\n141,hr,61,bpm\n141,hr,999,bpm'
  await page.get_by_label('Measurements CSV file',exact=True).set_input_files({'name':'bad.csv','mimeType':'text/csv','buffer':bad.encode()});await page.locator('.import-error').wait_for();check('Invalid CSV is atomic',len((await stored())['readings'])==3)
  csv='day,signal,value,unit,note\n'+'\n'.join(f'{d},{sig},{val},{unit},Synthetic test only' for d in range(111,141) for sig,val,unit in [('sleep',7,'h'),('hr',60,'bpm')])
  await page.get_by_label('Measurements CSV file',exact=True).set_input_files({'name':'prior.csv','mimeType':'text/csv','buffer':csv.encode()});await page.locator('dialog').wait_for();check('CSV import requires confirmation',len((await stored())['readings'])==3);await page.get_by_role('button',name='Import readings',exact=True).click();check('Confirmed CSV persists valid rows',len((await stored())['readings'])==63)
  await page.get_by_label('Local flight day',exact=True).fill('141');await page.get_by_label('Local flight day',exact=True).press('Tab');await go('trends');await page.get_by_label('Trend indicator',exact=True).select_option('sleep');check('Prior user data creates a personal baseline','30 / 30' in await page.locator('main').inner_text())
  await openlog();await page.locator('dialog').get_by_role('combobox',name='Health indicator',exact=True).select_option('sleep');await page.locator('dialog').get_by_label('Measured value',exact=True).fill('4.5');await page.locator('dialog').get_by_role('combobox',name='Unit',exact=True).select_option('h');await page.locator('dialog').get_by_role('button',name='Save on device',exact=True).click();await page.locator('dialog').wait_for(state='detached');check('New local change recalculates against local baseline','Review change' in await page.locator('.trend-hero').inner_text())
  await go('actions');await page.get_by_role('button',name='Mark done',exact=True).first.click();await page.reload(wait_until='networkidle');check('Care-plan action persists','1 of 5 routine tasks recorded' in await page.locator('main').inner_text())
  await go('handover');await page.get_by_label('Situation',exact=True).fill('Synthetic test: sleep changed.');await page.get_by_label('Background',exact=True).fill('Thirty prior test days; repeated measurement.');await page.get_by_label('Request for review',exact=True).fill('Review device and context.');
  async with page.expect_download() as event:await page.get_by_role('button',name='Evidence JSON',exact=True).click()
  file=await event.value;report=json.loads(pathlib.Path(await file.path()).read_text());check('Evidence export contains rule, mode and observations',report['rule']=='PROHOR-IQR-3.0' and len(report['assessments'])==12 and report['mode'].startswith('LOCAL'));check('Handover preserves user notes',report['situation']=='Synthetic test: sleep changed.')
  async with page.expect_download() as event:await page.get_by_role('button',name='Download report',exact=True).click()
  text=pathlib.Path(await (await event.value).path()).read_text();check('Text handover states nothing was transmitted','No message has been transmitted.' in text)
  await page.pdf(path=str(ROOT/'docs/test-results/sample-handover.pdf'),format='A4',print_background=True);check('Printable PDF is generated',(ROOT/'docs/test-results/sample-handover.pdf').stat().st_size>15000)
  await go('settings')
  async with page.expect_download() as event:await page.get_by_role('button',name='Backup JSON',exact=True).click()
  backup=pathlib.Path(await (await event.value).path()).read_bytes();check('Workspace backup includes local records',len(json.loads(backup)['readings'])==64)
  await go('logbook');await page.get_by_role('button',name='Delete Sleep duration on day 141',exact=True).first.click();await page.locator('dialog').get_by_role('button',name='Delete reading',exact=True).click();check('Deleting a local record changes only the local store',len((await stored())['readings'])==63)
  await go('settings');await page.get_by_label('Backup JSON file',exact=True).set_input_files({'name':'backup.json','mimeType':'application/json','buffer':backup});await page.locator('dialog').get_by_role('button',name='Replace workspace',exact=True).click();check('Validated restore recovers the full backup',len((await stored())['readings'])==64)
  await go('evidence');await page.get_by_text('SHA-256 verified · source bytes unchanged',exact=True).wait_for();check('NASA source hash is verified in browser',await page.get_by_text('SHA-256 verified · source bytes unchanged',exact=True).is_visible());check('Shared NASA anomaly is computed','3 of 4 crew are below' in await page.locator('main').inner_text())
  await page.get_by_label('Archive subject',exact=True).select_option('C003');check('Archive subject selection works','C003 · pre-flight median' in await page.locator('main').inner_text());await page.get_by_label('Archive analyte',exact=True).select_option('CALCIUM');check('Archive analyte selection works','C003 · CALCIUM' in await page.locator('main').inner_text())
  await page.get_by_label('Search NASA study library',exact=True).fill('OSD-569');check('Study filter works',await page.locator('.study-card').count()==1)
  await page.route('**/api/feeds*',lambda route:route.abort());await page.get_by_role('button',name='Refresh metadata',exact=True).click();await page.get_by_text('Network refresh unavailable. Displaying the bundled, dated snapshot.',exact=True).wait_for();check('API failure visibly falls back to a dated snapshot',await page.get_by_text('Network refresh unavailable. Displaying the bundled, dated snapshot.',exact=True).is_visible());await page.unroute('**/api/feeds*')
  await ctx.set_offline(True);await go('overview');check('Offline reload keeps local records',len((await stored())['readings'])==64);check('Offline shell remains functional',await page.locator('h1').count()==1)
  await go('evidence');await page.get_by_text('SHA-256 verified · source bytes unchanged',exact=True).wait_for();check('NASA CSV and integrity checks work offline',await page.get_by_text('SHA-256 verified · source bytes unchanged',exact=True).is_visible())
  await go('logbook');await openlog();await page.locator('dialog').get_by_role('combobox',name='Health indicator',exact=True).select_option('temp');await page.locator('dialog').get_by_label('Measured value',exact=True).fill('36.7');await page.locator('dialog').get_by_role('button',name='Save on device',exact=True).click();await page.locator('dialog').wait_for(state='detached');check('Offline reading entry persists',len((await stored())['readings'])==65)
  await ctx.set_offline(False);await go('replay');await page.get_by_role('button',name='Reset replay',exact=True).click();await page.get_by_role('button',name='Play scenario',exact=True).click();await page.wait_for_timeout(3800);await page.get_by_role('button',name='Pause replay',exact=True).click();check('Replay advances without a server telemetry stream',(await stored())['settings']['day']==143);check('Replay never deletes personal readings',len((await stored())['readings'])==65)
  await page.set_viewport_size({'width':390,'height':844});await go('overview');await page.get_by_role('button',name='Toggle navigation',exact=True).click();check('Mobile navigation opens',await page.locator('.sidebar.open').count()==1);await page.get_by_role('link',name='NASA evidence',exact=False).click();check('Mobile navigation closes on navigation',await page.locator('.sidebar.open').count()==0);check('Mobile content stays within viewport',await page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  check('No health record POST requests were made',posts==[]);check('No uncaught JavaScript errors in workflow',errors==[])
  await ctx.close()
  recovery=await browser.new_context();rp=await recovery.new_page();await rp.goto(URL);await rp.evaluate('localStorage.setItem("prohor.v3.workspace","bad original data")');await rp.reload(wait_until='networkidle');await rp.get_by_label('Flight day',exact=True).select_option('142');check('Corrupt storage is protected from silent overwrite',await rp.evaluate('localStorage.getItem("prohor.v3.workspace")')=='bad original data');await rp.goto(URL+'/#settings');await rp.get_by_role('button',name='Erase local data',exact=True).click();await rp.get_by_label('Confirmation',exact=True).fill('DELETE');await rp.locator('dialog').get_by_role('button',name='Erase data',exact=True).click();check('Explicit recovery reset is possible',await rp.evaluate('JSON.parse(localStorage.getItem("prohor.v3.workspace")).version')==3)
  await recovery.close();await browser.close()
 (ROOT/'docs/test-results/e2e.json').write_text(json.dumps({'checks':len(results),'results':results},indent=2))
try:asyncio.run(main())
except BaseException:
 (ROOT/'docs/test-results/e2e-partial.json').write_text(json.dumps(results,indent=2))

 raise
