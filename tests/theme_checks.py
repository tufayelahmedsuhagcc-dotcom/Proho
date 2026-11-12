"""Theme, contrast and interaction regression checks against the production server.

Run: python tests/theme_checks.py
Requires the same Playwright installation as the existing browser tests.
"""
import asyncio
import hashlib
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.getenv('PROHOR_URL', 'http://127.0.0.1:3000')
REPORT = ROOT / 'docs/test-results/theme'
SHOTS = REPORT / 'screenshots'
REPORT.mkdir(parents=True, exist_ok=True)
SHOTS.mkdir(parents=True, exist_ok=True)
results = []


def check(name, passed, detail=None):
    results.append({'name': name, 'passed': bool(passed), 'detail': detail})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)
    assert passed, f'{name}: {detail}'


def luminance(hex_color):
    rgb = [int(hex_color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb]
    return sum(a*b for a, b in zip(linear, [.2126, .7152, .0722]))


def contrast(a, b):
    hi, lo = sorted([luminance(a), luminance(b)], reverse=True)
    return (hi + .05) / (lo + .05)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1440, 'height': 1050}, color_scheme='dark',
            reduced_motion='reduce', accept_downloads=True,
        )
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))

        async def go(route):
            await page.goto(URL + '/#' + route, wait_until='networkidle')

        async def axe(name):
            await page.add_script_tag(path=str(ROOT / 'node_modules/axe-core/axe.min.js'))
            violations = await page.evaluate('''async () => (await axe.run(document, {
                runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa']}
            })).violations.map(v => ({id: v.id, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary}))}))''')
            check('Axe: ' + name, not violations, violations)

        await go('overview')
        await page.evaluate('navigator.serviceWorker.ready')
        await page.wait_for_function('!!navigator.serviceWorker.controller')
        check('White theme stays light under a dark OS preference',
              await page.evaluate('getComputedStyle(document.documentElement).colorScheme') == 'light')
        check('Application panels are white',
              await page.locator('.panel').first.evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)')
        check('Browser theme-color is white',
              await page.locator('meta[name="theme-color"]').get_attribute('content') == '#ffffff')
        manifest = await (await page.request.get(URL + '/manifest.webmanifest')).json()
        check('Installable app uses the white theme',
              manifest['background_color'] == '#ffffff' and manifest['theme_color'] == '#ffffff')
        variables = await page.evaluate('''() => {
            const style = getComputedStyle(document.documentElement);
            return Object.fromEntries(['text','muted','bg','panel','mint','on-accent','amber','warning-text',
            'warning-soft','blue','historical-soft','red','danger-soft','control-line','atlas-bone-line',
            'chart-1','chart-2','chart-3','chart-4'].map(k => [k, style.getPropertyValue('--'+k).trim()]));
        }''')
        pairs = [
            ('Primary text', 'text', 'panel', 7),
            ('Secondary text', 'muted', 'panel', 4.5),
            ('Secondary text on page canvas', 'muted', 'bg', 4.5),
            ('Primary action', 'on-accent', 'mint', 4.5),
            ('Review status', 'warning-text', 'warning-soft', 4.5),
            ('Historical status', 'blue', 'historical-soft', 4.5),
            ('Destructive action', 'red', 'danger-soft', 4.5),
            ('Form control boundary', 'control-line', 'panel', 3),
            ('Anatomical structure', 'atlas-bone-line', 'panel', 3),
        ]
        for label, fg, bg, minimum in pairs:
            ratio = contrast(variables[fg], variables[bg])
            check(label + ' contrast', ratio >= minimum, {'ratio': round(ratio, 2), 'minimum': minimum})
        for name in ['chart-1', 'chart-2', 'chart-3', 'chart-4']:
            rgb = [round(int(variables[name][i:i+2], 16) * .8 + 255 * .2) for i in (1, 3, 5)]
            blended = '#' + ''.join(f'{c:02x}' for c in rgb)
            ratio = contrast(blended, variables['panel'])
            check(name + ' remains visible when unselected', ratio >= 3, {'ratio': round(ratio, 2)})
        await page.screenshot(path=str(SHOTS / 'overview-desktop.png'), full_page=True)

        await go('atlas')
        await page.locator('.system-item').filter(has_text='Cardiovascular').click()
        await page.locator('.atlas-panel').screenshot(path=str(SHOTS / 'atlas-anatomy.png'))
        await page.get_by_role('button', name='Skeleton', exact=True).click()
        check('Skeleton remains available on the light canvas', await page.locator('.skeleton-view').count() == 1)
        await page.locator('.atlas-panel').screenshot(path=str(SHOTS / 'atlas-skeleton.png'))
        hotspot = page.locator('svg.body-atlas [role=button][aria-label^="Respiratory:"]').last
        await hotspot.focus()
        await page.keyboard.press('Space')
        check('Keyboard anatomy selection and visible focus work',
              await page.locator('.system-detail h3').inner_text() == 'Respiratory' and
              await hotspot.locator('.selected-ring').evaluate('(e) => getComputedStyle(e).stroke') == 'rgb(11, 84, 62)')

        await page.get_by_role('button', name='Log a reading', exact=True).first.click()
        dialog = page.locator('dialog')
        check('Reading dialog uses a white surface',
              await dialog.evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)')
        await axe('single-reading dialog')
        await dialog.get_by_role('combobox', name='Health indicator', exact=True).select_option('hr')
        await dialog.get_by_role('spinbutton', name='Measured value', exact=True).fill('900')
        await dialog.get_by_role('button', name='Save on device', exact=True).click()
        await axe('form validation error')
        await dialog.screenshot(path=str(SHOTS / 'reading-dialog.png'))
        await dialog.get_by_role('button', name='Daily check-in', exact=True).click()
        await axe('daily check-in dialog')
        await page.keyboard.press('Escape')

        await page.keyboard.press('Control+k')
        await axe('command-search dialog')
        await page.keyboard.press('Escape')
        await go('settings')
        await page.get_by_role('button', name='Erase local data', exact=True).click()
        await axe('destructive-action confirmation')
        await page.keyboard.press('Escape')

        await go('evidence')
        await page.get_by_text('SHA-256 verified · source bytes unchanged', exact=True).wait_for()
        check('NASA source integrity is still verified', await page.locator('.archive-chart').count() == 1)
        check('Four research series have distinct line styles',
              await page.locator('.archive-chart > g path[stroke-dasharray]').count() == 3)
        await page.screenshot(path=str(SHOTS / 'evidence-desktop.png'), full_page=True)
        await go('trends')
        await page.screenshot(path=str(SHOTS / 'trends-desktop.png'), full_page=True)
        await go('environment')
        await page.screenshot(path=str(SHOTS / 'environment-desktop.png'), full_page=True)
        await go('handover')
        await page.get_by_label('Situation', exact=True).fill('Synthetic white-theme test. No personal health data.')
        await context.set_offline(True)
        await page.reload(wait_until='networkidle')
        check('White theme survives an offline reload',
              await page.locator('.report-preview').evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)')
        async with page.expect_download() as event:
            await page.get_by_role('button', name='Download report', exact=True).click()
        download = await event.value
        text = Path(await download.path()).read_text()
        check('Offline handover export still works', 'No message has been transmitted.' in text)
        await page.screenshot(path=str(SHOTS / 'handover-desktop.png'), full_page=True)
        await context.set_offline(False)

        await page.set_viewport_size({'width': 390, 'height': 844})
        await go('overview')
        await page.screenshot(path=str(SHOTS / 'overview-mobile.png'), full_page=True)
        await page.get_by_role('button', name='Toggle navigation', exact=True).click()
        check('Mobile navigation has a white surface',
              await page.locator('.sidebar').evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)')
        await axe('open mobile navigation')
        await page.screenshot(path=str(SHOTS / 'mobile-menu.png'))
        await page.keyboard.press('Escape')
        await page.get_by_role('button', name='Log a reading', exact=True).first.click()
        await axe('mobile reading dialog')
        await page.keyboard.press('Escape')
        check('No uncaught JavaScript errors in theme checks', not errors, errors)
        await browser.close()

    baseline = json.loads((REPORT / 'preserved-files.json').read_text())
    differences = [name for name, expected in baseline.items()
                   if hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != expected]
    check('Computation, data, storage and feed source files are unchanged', not differences,
          {'filesCompared': len(baseline), 'differences': differences})


try:
    asyncio.run(main())
finally:
    (REPORT / 'theme-checks.json').write_text(json.dumps({
        'checks': len(results), 'passed': sum(r['passed'] for r in results), 'results': results,
    }, indent=2) + '\n')
