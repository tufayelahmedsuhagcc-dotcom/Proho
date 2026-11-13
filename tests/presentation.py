"""Check the two videos, slide controls, PDF and offline caching on several screen widths."""
import os
import pathlib
from playwright.sync_api import sync_playwright
URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000')
OUT=pathlib.Path(__file__).resolve().parents[1]/'docs/test-results'
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for width in (320,390,768,1440):
  ctx=b.new_context(viewport={'width':width,'height':900});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(URL+'/#overview',wait_until='networkidle')
  assert page.get_by_role('heading',name='The mission, in a moment.').count()==1
  assert page.locator('.landing-film video').count()==1
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  page.locator('.landing-film').scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'landing-video-{width}.png'))
  page.locator('.landing-film > button').click();assert page.url.endswith('#judges');assert page.locator('.video-grid video').count()==2;assert page.locator('.dossier-card').count()==4
  assert page.get_by_role('heading',name='A quieter watch. A clearer picture.').count()==1
  for _ in range(6):page.get_by_role('button',name='Next slide').click()
  assert page.get_by_role('heading',name='Human first. Always.').count()==1;assert page.get_by_role('button',name='Next slide').is_disabled()
  page.get_by_role('button',name='Go to slide 4: One reading. More context.').click();assert page.get_by_text('5.6 hours against a 7.4-hour',exact=False).count()>=1
  page.locator('.slide-section').scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'judges-slides-{width}.png'))
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  for path in ['/media/prohor-30-second.mp4','/media/prohor-four-minute.mp4']:
   res=ctx.request.get(URL+path,headers={'Range':'bytes=0-1023'}); assert res.status==206,(path,res.status);assert 'video/mp4' in res.headers.get('content-type','');assert len(res.body())==1024
  pdf=ctx.request.get(URL+'/docs/PROHOR_Seven_Slide_Presentation.pdf');assert pdf.status==200 and pdf.body().startswith(b'%PDF-')
  page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('!!navigator.serviceWorker.controller');cached=page.evaluate("async()=>{const keys=await caches.keys();const c=await caches.open(keys.find(x=>x.startsWith('prohor-')));return [(await c.match('/media/prohor-30-second.mp4'))!==undefined,(await c.match('/docs/PROHOR_Seven_Slide_Presentation.pdf'))!==undefined]}");assert cached==[False,True],cached
  assert not errors,errors;print('PASS',width,'layout, video links, slide navigation, range and cache policy',flush=True);ctx.close()
 b.close()
