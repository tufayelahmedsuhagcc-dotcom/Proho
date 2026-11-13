"""Additional 2026 judge-path, narrow viewport and NASA metadata regression checks.
Run against a production server after npm run build / npm start.
"""
import os
from playwright.sync_api import sync_playwright
URL = os.getenv('PROHOR_URL', 'http://127.0.0.1:3000')
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in (320, 375, 390):
        ctx = browser.new_context(viewport={'width': width, 'height': 850}, is_mobile=True, has_touch=True, accept_downloads=True)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL, wait_until='networkidle')
        for route in ('overview','atlas','logbook','trends','actions','evidence','environment','replay','handover','judges','settings','about'):
            page.goto(f'{URL}/#{route}', wait_until='networkidle')
            dims=page.evaluate('({client:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth})')
            assert dims['scroll'] <= dims['client'], (width, route, dims)
        print('PASS mobile page widths', width, flush=True)
        page.goto(URL+'/#overview', wait_until='networkidle')
        page.get_by_role('button', name='Toggle navigation').click()
        page.get_by_role('link',name='Health atlas').click()
        assert page.url.endswith('#atlas')
        assert not page.get_by_role('link',name='Health atlas').is_visible()
        page.goto(URL+'/#overview', wait_until='networkidle')
        for name,route in [('See the change','trends'),('Explore the evidence','evidence'),('Prepare for review','handover')]:
            page.goto(URL+'/#overview', wait_until='networkidle')
            page.get_by_role('button',name=name).click()
            assert page.url.endswith('#'+route), (name,page.url)
            assert page.get_by_label('Data workspace').input_value() == 'demo'
        assert not errors, errors
        ctx.close()
    ctx = browser.new_context(viewport={'width':1440,'height':900}, accept_downloads=True)
    page = ctx.new_page(); page.goto(URL,wait_until='networkidle')
    page.get_by_role('button',name='Log a reading',exact=True).first.click()
    page.get_by_placeholder('Enter a value').fill('6.7')
    page.get_by_role('button',name='Save on device').click()
    assert page.get_by_label('Data workspace').input_value() == 'local'
    page.get_by_role('button',name='See the change').click()
    assert page.get_by_label('Data workspace').input_value() == 'demo'
    page.get_by_label('Data workspace').select_option('local')
    page.goto(URL+'/#logbook', wait_until='networkidle')
    assert '6.7 h' in page.locator('main').inner_text()
    print('PASS guided tour preserves local records', flush=True)
    page.goto(URL+'/#evidence',wait_until='networkidle')
    page.get_by_label('Search NASA study library').fill('OSD-571')
    page.wait_for_timeout(400)
    assert page.locator('.study-card').count()==1
    card=page.locator('.study-card').inner_text()
    assert 'metadata only' in card and 'Plasma Profiling' in card
    print('PASS OSD-571 metadata and limitation label', flush=True)
    page.goto(URL+'/#about',wait_until='networkidle')
    assert page.locator('a[href="https://github.com/tufayelahmedsuhagcc-dotcom/prohor"]').count()==1
    print('PASS source repository link',flush=True)
    browser.close()
