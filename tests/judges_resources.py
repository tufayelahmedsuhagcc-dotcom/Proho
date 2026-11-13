"""Judge resource: desktop/mobile access, valid PDF download and offline precache."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.getenv('PROHOR_URL','http://127.0.0.1:3000')
with sync_playwright() as p:
    b=p.chromium.launch()
    for width in (320,390,1440):
        ctx=b.new_context(viewport={'width':width,'height':900},accept_downloads=True)
        page=ctx.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL+'/#overview',wait_until='networkidle')
        page.get_by_role('button',name='Judges’ resources & PDF').click()
        assert page.url.endswith('#judges')
        assert page.get_by_role('heading',name='Review the evidence, not just the interface.').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth')
        with page.expect_download() as info: page.get_by_role('link',name='Download judges’ brief').click()
        download=info.value
        assert download.suggested_filename=='PROHOR_Judges_Brief.pdf'
        assert Path(download.path()).read_bytes().startswith(b'%PDF-')
        assert not errors, errors
        print('PASS judges resource and download',width,flush=True)
        if width == 1440:
            page.evaluate('navigator.serviceWorker.ready')
            page.wait_for_function('!!navigator.serviceWorker.controller')
            cached=page.evaluate("async()=>!!(await caches.match('/docs/PROHOR_Judges_Brief.pdf'))")
            assert cached
            ctx.set_offline(True)
            page.reload(wait_until='domcontentloaded')
            assert page.get_by_role('heading',name='Review the evidence, not just the interface.').is_visible()
            result=page.evaluate("async()=>{const r=await fetch('/docs/PROHOR_Judges_Brief.pdf');return [r.status,(await r.text()).slice(0,5)]}")
            assert result==[200,'%PDF-'],result
            print('PASS judges PDF and page offline after precache',flush=True)
        ctx.close()
    b.close()
