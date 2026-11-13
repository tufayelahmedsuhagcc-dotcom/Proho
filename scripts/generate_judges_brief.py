"""Generate the judge-facing PDF: pip install reportlab && python scripts/generate_judges_brief.py"""
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/docs/PROHOR_Judges_Brief.pdf'
pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
W,H=A4
c=Canvas(str(OUT),pagesize=A4, pageCompression=1)
c.setTitle('PROHOR | Judges’ Brief')
c.setAuthor('Skorpe Monad')
ink=HexColor('#172b23'); green=HexColor('#1d6045'); muted=HexColor('#53665b'); pale=HexColor('#eef6ef')
body=ParagraphStyle('body',fontName='DejaVu',fontSize=9.3,leading=14.2,textColor=ink,spaceAfter=0)
small=ParagraphStyle('small',fontName='DejaVu',fontSize=8.2,leading=12,textColor=muted)
head=ParagraphStyle('head',fontName='DejaVuBold',fontSize=13,leading=17,textColor=ink)

def para(text,y,style=body,x=48,width=499):
    p=Paragraph(text,style); _,h=p.wrap(width,800); p.drawOn(c,x,y-h); return y-h

def label(text,y):
    c.setFillColor(green); c.setFont('DejaVuBold',8); c.drawString(48,y,text.upper()); return y-20

def title(text,sub):
    c.setFillColor(ink); c.setFont('DejaVuBold',24); c.drawString(48,H-83,text)
    para(sub,H-98,small)

def header(num):
    c.setFillColor(green); c.setFont('DejaVuBold',10); c.drawString(48,H-33,'PROHOR')
    c.setFillColor(muted); c.setFont('DejaVu',8); c.drawRightString(W-48,H-33,'SKORPE MONAD  /  JUDGES’ BRIEF')
    c.setStrokeColor(HexColor('#d5e4d9')); c.line(48,H-43,W-48,H-43)
    c.setFont('DejaVu',8); c.drawString(48,30,'Independent prototype  •  Not medical advice  •  No NASA endorsement implied')
    c.drawRightString(W-48,30,f'{num:02d} / 04')

def box(text,y):
    p=Paragraph(text,body); _,h=p.wrap(465,800); c.setFillColor(pale); c.roundRect(48,y-h-27,499,h+27,9,fill=1,stroke=0); p.drawOn(c,65,y-h-13); return y-h-40

def section(name,text,y):
    y=para(name,y,head)-6; return para(text,y)-18

def link(label,url): return f'<link href="{url}" color="#1d6045"><u>{label}</u></link>'

header(1); title('A clearer picture of change.','PROJECT OVERVIEW  /  EVALUATOR EDITION')
y=H-148
y=para('PROHOR is an offline-capable health-monitoring prototype that helps a crew member organize personal indicators, compare them with their own prior observations, and prepare context for a human reviewer.',y)-20
y=box('<b>At a glance.</b> A deterministic personal-baseline engine, a navigable health atlas, a local logbook, NASA research context and a structured handover — designed for human interpretation rather than automated diagnosis.',y)
y=label('The challenge',y-5)
y=para('On long missions, crew need a way to notice meaningful changes when immediate specialist support may be limited. PROHOR turns a set of measurements into an understandable, traceable workflow: observe, compare, inspect context and share for review.',y)-22
y=label('Try it in three steps',y)
for t in ['<b>01  Observe.</b> Open Mission overview and choose “See the change” in the guided tour. The synthetic scenario selects CDR-01, flight day 146; inspect the sleep change in Trends.', '<b>02  Understand.</b> Review the prior-day median, coverage and rule explanation. Visit NASA evidence to explore the historical OSD-575 metabolic panel separately from the demo.', '<b>03  Prepare.</b> Open Crew handover to inspect and export a structured summary. Data &amp; settings provides local CSV import/export and controls.']:
    y=para(t,y)-11
y-=5
y=para(f'{link("Open PROHOR", "https://prohor-rho.vercel.app/")}  ·  {link("Source repository", "https://github.com/tufayelahmedsuhagcc-dotcom/prohor")}  ·  {link("Official challenge", "https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/")}',y,small)
c.showPage()

header(2); title('Where the data comes from.','INTEGRATIONS  /  TRACEABILITY  /  BOUNDARIES')
y=H-144
y=section('NASA OSD-575  |  analyzed historical data', 'The evidence explorer parses NASA’s original Inspiration4 submitted comprehensive metabolic panel. It contains 531 rows, 19 analytes and four coded subjects sampled before and after a three-day 2021 mission. It is historical research, not live crew telemetry or validation for a Mars mission.', y)
y=para('Original file: <b>LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv</b><br/>SHA-256 (25,275 bytes):',y,small)-4
y=para('dab247eb794edab59aaaa683c85fd1f2dbf4ae3684872739338e10ead4192a0c',y,ParagraphStyle('hash',parent=small,fontName='DejaVu',fontSize=7.8))-8
y=para(f'{link("NASA study and source", "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575")}  ·  {link("Original CSV download", "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&amp;file=LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv")}  ·  {link("Provenance documentation", "https://github.com/tufayelahmedsuhagcc-dotcom/prohor/blob/main/docs/DATA-PROVENANCE.md")}',y,small)-19
y=section('Related NASA studies  |  metadata only', 'OSD-569 and OSD-571 provide titles, descriptions and archive links in a curated library; they do not supply personal readings or additional chart values. OSD-87 is optional mouse-study metadata. NASA Human Research Program materials supply hazard and sleep context, not approval of PROHOR’s thresholds.', y)
y=section('NOAA space weather  |  Earth context', 'The NOAA SWPC planetary Kp feed provides Earth geomagnetic context, with source and observation times. It is not Mars or cabin conditions, a crew radiation dose, or evidence that space weather caused a health change.',y)
y=section('Synthetic and local  |  kept separate', 'The built-in mission is a deterministic synthetic scenario, not real astronaut health data. Users may enter or import their own readings locally. NASA research records do not enter the personal-baseline engine.',y)
y=box('<b>Honest status.</b> Network responses and dated fallback snapshots are labeled. If unavailable, feeds fall back to cached data rather than inventing observations; the source observation may be older than retrieval.',y)
c.showPage()

header(3); title('How the system works.','METHOD  /  PRIVACY  /  RESILIENCE')
y=H-144
y=section('From observation to review', 'Local readings → validation and unit conversion → prior-day baseline → directional change band → plain-language trend and handover. Data stay in the browser workspace; there is no health-record submission endpoint or remote health synchronization.',y)
y=section('The baseline rule', 'For local inputs, use flight days d−30 through d−1, with the latest valid observation per day and at least seven distinct prior days. Compute the median and interquartile range (IQR). The median-centered band has width max(1.5 × IQR, a signal-specific noise floor). A value outside its configured direction is flagged for review.',y)
y=para('The synthetic replay uses a fixed enrollment window, FD 111–140, for scenario days 142–147. Seven to 20 days are labeled provisional; 21–30 established. Those labels and cutoffs are developer choices, not clinical confidence or safety thresholds.',y)-18
y=section('NASA explorer method', 'The OSD-575 browser calculates each chosen subject’s pre-flight median and descriptive change from that median. The CSV checksum is checked where Web Crypto is available; a mismatch blocks analysis. Limited samples, lab intervals and missing values must be interpreted in their original context.',y)
y=section('Architecture and availability', 'React, TypeScript and Vite run the interface and analysis. Same-origin serverless /api/feeds adapters retrieve NASA OSDR study metadata and NOAA Kp. A service worker precaches the app, data and this brief after an initial successful online visit; browser storage restrictions or cache eviction can prevent offline use.',y)
y=box('<b>Privacy and caution.</b> Browser storage is device-local but not a secure medical record: shared devices, browser extensions, exports and backups can expose data. Do not enter sensitive real health information without an appropriate security review.',y)
y=para(link('Read the full methodology and signal-specific rules', 'https://github.com/tufayelahmedsuhagcc-dotcom/prohor/blob/main/docs/METHODOLOGY.md'),y,small)
c.showPage()

header(4); title('Evidence and next steps.','VALIDATION  /  LIMITATIONS  /  REFERENCES')
y=H-144
y=section('What the prototype demonstrates', 'A reproducible synthetic walk-through, separate local data entry and CSV validation, NASA source exploration, a Kp context feed, and a structured handover. The repository contains unit and browser tests for baseline behavior, import, source parsing, navigation and offline workflows.',y)
y=section('What it does not establish', 'This is not a diagnostic device, prediction model, treatment recommendation or fitness-for-duty assessment. The change rules have not been clinically validated. A stable baseline can still be unhealthy; missing values are not normal values. Human judgment and applicable mission medical procedures take precedence, especially for sudden or severe symptoms.',y)
y=section('Responsible next steps', 'Clinical and human-factors evaluation; threat modeling and protected data handling; sensor integration only after engineering and privacy review; prospective validation with appropriate permissions. These are future work, not current features.',y)
y=label('Primary references',y)
for t in [
 link('NASA OSD-575 — Inspiration4 serum metabolic panel', 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-575'),
 link('NASA OSD-569 — related whole-blood study', 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-569')+'  ·  '+link('OSD-571 — human plasma study', 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-571'),
 link('NOAA SWPC — planetary K index', 'https://www.swpc.noaa.gov/products/planetary-k-index')+'  ·  '+link('NASA HRP — human spaceflight hazards', 'https://www.nasa.gov/hrp/hazards/'),
 link('Source, tests and documentation', 'https://github.com/tufayelahmedsuhagcc-dotcom/prohor')]: y=para('•  '+t,y,small)-6
y-=10
y=para('<b>Team:</b> Skorpe Monad — Tufayel Ahmed, Annapurna Das Protyasha, Rakthim Deb Rudro, Mir Shahi Ahmod and Tonusri Deb Diggi.',y)-10
y=para('<b>AI transparency:</b> AI-assisted tools were used in website updates, documentation and presentation production. The team should review and complete its own project-submission disclosure, including all tools actually used.',y,small)
c.save(); print('Created', OUT)
