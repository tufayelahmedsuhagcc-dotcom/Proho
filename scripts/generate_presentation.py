#!/usr/bin/env python3
"""Create the seven-slide judges' presentation from project facts and real UI captures."""
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from pathlib import Path
from textwrap import wrap
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/docs/PROHOR_Seven_Slide_Presentation.pdf'
pdfmetrics.registerFont(TTFont('Inter',str(ROOT/'docs'/'fonts'/'Inter.ttf')) if (ROOT/'docs'/'fonts'/'Inter.ttf').exists() else TTFont('Inter','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('InterBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
slides=[
('THE MISSION','A quieter watch.\nA clearer picture.','PROHOR is an offline-capable research workspace for putting astronaut health readings into context.', ['Built by Team Skorpe Monad','A prototype for self-assessment and human review','Not a medical device'],'atlas.jpg'),
('THE CHALLENGE','Distance changes\nthe question.','On long missions, crews need to understand changes in health indicators even when communication is delayed.', ['Collect meaningful measurements','See change against personal history','Prepare a human-reviewed next step'],'atlas.jpg'),
('THE WORKFLOW','Observe. Understand.\nPrepare.','A simple flow connects a recorded reading to an explainable trend, a routine prompt and a handover.', ['Log a reading or import a local CSV','Inspect a trend and its rule','Export context for review; not a diagnosis'],'handover.jpg'),
('A SYNTHETIC EXAMPLE','One reading.\nMore context.','In the demo, sleep is 5.6 hours against a 7.4-hour personal median. This is simulated, not astronaut telemetry.', ['Compare to prior personal observations','An unvalidated prototype heuristic','A flag prompts review; it is not a diagnosis'],'baseline.jpg'),
('NASA OPEN DATA','Real research.\nClear limits.','A separate explorer presents historical Inspiration4 blood-serum measurements from NASA OSD-575.', ['Source-linked measurements and study context','Four coded participants; historical data','Not live telemetry or validation of the demo rule'],'nasa.jpg'),
('OFFLINE & PORTABILITY','Prepared\nfor a gap.','After initial caching, the workspace can reload without a network. Local records remain in the browser.', ['CSV import checks required fields and units','Back up or export locally','No hidden sync; browser storage is not encrypted'],'offline.jpg'),
('RESPONSIBLE NEXT STEPS','Human first.\nAlways.','PROHOR is a research prototype, not NASA-endorsed, a medical device or a clinical decision system.', ['Validate with domain experts before real use','Protect sensitive data and follow procedures','Explore source, methods and judges’ dossiers'],'handover.jpg'),
]
W,H=960,540;c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('PROHOR — Seven-slide project presentation');c.setAuthor('Team Skorpe Monad');
def linewrap(txt,font,size,width):
 words=txt.split(); lines=[];line=''
 for w in words:
  nxt=(line+' '+w).strip()
  if pdfmetrics.stringWidth(nxt,font,size)>width and line:lines.append(line);line=w
  else:line=nxt
 if line:lines.append(line)
 return lines
for idx,(kicker,title,desc,points,img) in enumerate(slides):
 c.setFillColor(HexColor('#f8faf9'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setStrokeColor(HexColor('#d6e4d9'));c.line(40,H-59,W-40,H-59)
 c.setFont('InterBold',9);c.setFillColor(HexColor('#27664d'));c.drawString(40,H-40,'PROHOR  /  MISSION HEALTH INTELLIGENCE');c.drawRightString(W-40,H-40,f'{idx+1:02d}  /  07')
 c.setFont('InterBold',10);c.setFillColor(HexColor('#27664d'));c.drawString(48, H-105,f'{idx+1:02d}  /  {kicker}')
 y=H-148;c.setFillColor(HexColor('#183429'));c.setFont('InterBold',27)
 for l in title.split('\n'):c.drawString(48,y,l);y-=34
 y-=17;c.setFillColor(HexColor('#435d4e'));c.setFont('Inter',12)
 for l in linewrap(desc,'Inter',12,380):c.drawString(48,y,l);y-=18
 y-=14
 for p in points:
  c.setFillColor(HexColor('#1b7454'));c.circle(52,y+3,2.5,fill=1,stroke=0);c.setFont('Inter',10.5);c.setFillColor(HexColor('#385447'))
  for l in linewrap(p,'Inter',10.5,358):c.drawString(63,y,l);y-=16
  y-=5
 x=480; iw=435; ih=245; iy=173
 c.setFillColor(HexColor('#dce8de'));c.roundRect(x+4,iy-5,iw,ih,8,fill=1,stroke=0)
 c.drawImage(ImageReader(str(ROOT/'public/slides'/img)),x,iy,width=iw,height=ih,mask='auto',preserveAspectRatio=False)
 c.setFillColor(HexColor('#4e6858'));c.setFont('Inter',8);c.drawString(x,iy-19,'UPDATED LOCAL BUILD  /  REAL APP CAPTURE')
 c.setStrokeColor(HexColor('#d6e4d9'));c.line(40,61,W-40,61)
 c.setFillColor(HexColor('#516c5a'));c.setFont('InterBold',8);c.drawString(40,39,'TEAM SKORPE MONAD');c.drawRightString(W-40,39,'RESEARCH PROTOTYPE  ·  NOT A MEDICAL DEVICE')
 c.linkURL('https://prohor-rho.vercel.app', (40,20,250,51), relative=0)
 if idx==4:c.linkURL('https://osdr.nasa.gov/bio/repo/data/studies/OSD-575',(48,110,440,260),relative=0)
 c.showPage()
c.save();print('Wrote',OUT)
