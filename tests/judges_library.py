"""Exercise four individual PDFs, complete library download, responsive layout and offline availability."""
import os, zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000')
OUT=Path(__file__).resolve().parents[1]/'docs/test-results'
OUT.mkdir(parents=True,exist_ok=True)
DOCS=[('Mission & demo','PROHOR_01_Mission_and_Demo.pdf'),('Data & evidence','PROHOR_02_Data_and_Evidence.pdf'),('Technology & method','PROHOR_03_Technology_and_Method.pdf'),('Safety, impact & roadmap','PROHOR_04_Safety_Impact_and_Roadmap.pdf')]
with sync_playwright() as p:
 b=p.chromium.launch()
 for width in (320,375,390,768,1440):
  ctx=b.new_context(viewport={'width':width,'height':900},accept_downloads=True)
  page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto(URL+'/#overview',wait_until='networkidle')
  page.get_by_role('button',name='Judges’ resources & PDF').click()
  assert page.url.endswith('#judges')
  assert page.locator('.dossier-card').count()==4
  assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),width
  for title,file in DOCS:
   assert page.get_by_role('link',name=f'Open {title} PDF in a new tab').get_attribute('href')==f'/docs/{file}'
   with page.expect_download() as event: page.get_by_role('link',name=f'Download {title} PDF').click()
   d=event.value;assert d.suggested_filename==file and Path(d.path()).read_bytes().startswith(b'%PDF-')
  with page.expect_download() as event: page.get_by_role('link',name='Download all four').click()
  d=event.value
  with zipfile.ZipFile(d.path()) as z:
   assert sorted(z.namelist())==sorted(f for _,f in DOCS)
   assert z.testzip() is None
  assert not errors,errors
  print('PASS four PDFs, combined ZIP and layout',width,flush=True)
  if width==1440:
   page.screenshot(path=str(OUT/'judges-library-desktop.png'),full_page=True)
   page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('!!navigator.serviceWorker.controller')
   ctx.set_offline(True);page.reload(wait_until='domcontentloaded')
   for _,file in DOCS:
    result=page.evaluate("async path => {const r=await fetch(path);return [r.status,(await r.text()).slice(0,5)]}",'/docs/'+file)
    assert result==[200,'%PDF-'],(file,result)
   print('PASS all four PDFs after offline reload',flush=True)
  if width==390:page.screenshot(path=str(OUT/'judges-library-mobile.png'),full_page=True)
  ctx.close()
 b.close()
