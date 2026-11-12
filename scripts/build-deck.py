"""Builds the 7-slide PROHOR deck (16:9 PDF) from docs/screenshots."""
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor

W, H = 960, 540
INK = HexColor("#0b1f1c")
MUTED = HexColor("#5b6b66")
TEAL = HexColor("#0f766e")
AMBER = HexColor("#b45309")
PANEL = HexColor("#f4f7f5")
LINE = HexColor("#dde5e1")
SHOTS = os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots")
OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "demo", "PROHOR-deck.pdf")

def eyebrow(c, x, y, text, color=TEAL):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x, y, " ".join(text.upper()))

def title(c, x, y, text, size=30):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)

def body(c, x, y, lines, size=11, leading=16, color=INK, font="Helvetica"):
    c.setFillColor(color)
    c.setFont(font, size)
    for i, ln in enumerate(lines):
        c.drawString(x, y - i * leading, ln)

def bullet(c, x, y, head, text, size=10.5, width=0):
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, head)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", size)
    c.drawString(x, y - 14, text)

def frame(c):
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(40, 34, W - 40, 34)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(40, 22, "PROHOR / MISSION HEALTH INTELLIGENCE")
    c.drawRightString(W - 40, 22, "2026 NASA SPACE APPS CHALLENGE")

def shot(c, name, x, y, w, h, border=True):
    path = os.path.normpath(os.path.join(SHOTS, name))
    img = ImageReader(path)
    iw, ih = img.getSize()
    scale = w / iw
    dh = ih * scale
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img, x, y + h - dh, w, dh, mask=None)
    c.restoreState()
    if border:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.rect(x, y, w, h, stroke=1, fill=0)

def note(c, x, y, text, size=9):
    c.setFillColor(MUTED)
    c.setFont("Helvetica", size)
    c.drawString(x, y, text)

def build():
    os.makedirs(os.path.dirname(os.path.normpath(OUT)), exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=landscape((W, H)))
    c.setTitle("PROHOR — Mission Health Intelligence")
    c.setAuthor("PROHOR team")

    # 1 — title ------------------------------------------------------------
    c.setFillColor(PANEL)
    c.rect(0, 0, W, 210, stroke=0, fill=1)
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 210, W, H - 210, stroke=0, fill=1)
    eyebrow(c, 64, H - 96, "2026 NASA Space Apps Challenge · The Next Frontier")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 58)
    c.drawString(60, H - 170, "PROHOR")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 22)
    c.drawString(62, H - 200, "Mission Health Intelligence")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(62, 168, "Your readings. Your baseline. A clearer next step.")
    body(c, 62, 140, [
        "An offline-capable health workspace for astronauts who must assess themselves,",
        "with no clinic and a delayed link to the ground.",
    ], size=11.5, color=MUTED)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(62, 96, "LIVE PROTOTYPE")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 10.5)
    c.drawString(150, 96, "prohor-rho.vercel.app")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(330, 96, "SOURCE")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 10.5)
    c.drawString(380, 96, "github.com/tufayelahmedsuhagcc-dotcom/Proho")
    note(c, 62, 74, "Team: [names] · Challenge: Create Health Monitoring Software for Astronauts on Space Missions")
    note(c, 62, 58, "Research prototype. Not a medical device. Independent project; no NASA endorsement implied.")
    c.showPage()

    # 2 — the moment -------------------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "01 / The situation")
    title(c, 46, H - 96, "Up to twenty-two minutes", 26)
    title(c, 46, H - 124, "of delay. Five readings. No clinic.", 26)
    body(c, 48, H - 156, [
        "A crew member on a long-duration mission has to decide,",
        "alone, whether a number matters — and what to do next.",
    ], size=11, color=MUTED, leading=15)
    bullet(c, 48, H - 210, "What did I measure?", "A validated entry, in its original units.", 10.5)
    bullet(c, 48, H - 258, "How does it compare to my normal?", "A baseline from this person's own prior days only.", 10.5)
    bullet(c, 48, H - 306, "How sure is this?", "Coverage, direction and the rule, shown with the result.", 10.5)
    bullet(c, 48, H - 354, "What do I do now?", "One conservative step, documented and handed to a surgeon.", 10.5)
    note(c, 48, 62, "Screenshot: mission overview, flight day 146 — five indicators under review.")
    shot(c, "overview-desktop.png", 500, 78, 412, 380)
    c.showPage()

    # 3 — why a colour fails ----------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "02 / The gap")
    title(c, 46, H - 98, "A colour is not a reason.", 28)
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(48, H - 148, "Most health dashboards answer with red, amber or green.")
    body(c, 48, H - 172, ["That answer hides the four things a crew member needs to judge it."], size=11, color=MUTED)

    boxes = [
        ("A flag with no baseline", "Was this compared with the crew member, or with a textbook number?"),
        ("A flag with no sample size", "Two days of data is not a baseline. The interface rarely says which."),
        ("A flag with no rule", "A threshold cannot be checked, argued with, or corrected."),
        ("A flag with no next step", "An alarm without an action moves the decision back to the crew, unaided."),
    ]
    x, y = 48, H - 220
    for i, (h, t) in enumerate(boxes):
        bx = x + (i % 2) * 440
        by = y - (i // 2) * 96
        c.setFillColor(PANEL)
        c.rect(bx, by - 60, 414, 78, stroke=0, fill=1)
        c.setFillColor(AMBER)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(bx + 16, by - 6, h)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9.5)
        c.drawString(bx + 16, by - 24, t[:78])
        if len(t) > 78:
            c.drawString(bx + 16, by - 38, t[78:])
    note(c, 48, 62, "PROHOR's design rule: publish the uncertainty instead of a verdict.")
    c.showPage()

    # 4 — what it does -----------------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "03 / What PROHOR does")
    title(c, 46, H - 96, "Comparison you can audit.", 26)
    body(c, 48, H - 126, [
        "Median and interquartile range over the last 30 distinct prior days,",
        "excluding today, future days, invalid readings and missing values.",
    ], size=10.5, color=MUTED, leading=15)
    bullet(c, 48, H - 176, "7 days minimum", "below that, the app says so instead of reassuring you.", 10.5)
    bullet(c, 48, H - 220, "21+ days", "labelled established — never a confidence score.", 10.5)
    bullet(c, 48, H - 264, "Never borrowed", "no baseline from another crew member or another mode.", 10.5)
    bullet(c, 48, H - 308, "Every flag opens", "window, day count, direction, source readings, table view.", 10.5)
    note(c, 48, 62, "Screenshot: trends & baselines — the rule, the band and the coverage on one screen.")
    shot(c, "trends-desktop.png", 500, 78, 412, 380)
    c.showPage()

    # 5 — evidence ---------------------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "04 / The evidence")
    title(c, 46, H - 96, "NASA data, checked in front of you.", 26)
    bullet(c, 48, H - 148, "OSD-575", "531 published Inspiration4 metabolic-panel observations, parsed in-browser.", 10.5)
    bullet(c, 48, H - 196, "SHA-256", "the original CSV bytes are hashed and verified on load.", 10.5)
    bullet(c, 48, H - 244, "Recomputed", "medians recalculated per analyte and subject, with source row numbers.", 10.5)
    bullet(c, 48, H - 292, "Stated limits", "four crew, one short flight, shared sample intervals — said plainly.", 10.5)
    note(c, 48, 62, "Screenshot: NASA evidence — glucose, subject C001, pre-flight median 80 mg/dL.")
    shot(c, "evidence-desktop.png", 500, 78, 412, 380)
    c.showPage()

    # 6 — action -----------------------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "05 / The output")
    title(c, 46, H - 96, "The packet, not the alert.", 26)
    body(c, 48, H - 128, [
        "A flag ends in one conservative routine step, documented, and a structured",
        "handover the flight surgeon can read without re-deriving anything.",
    ], size=10.5, color=MUTED, leading=15)
    bullet(c, 48, H - 184, "Care plan", "done or deferred, persisted per crew, day and mode.", 10.5)
    bullet(c, 48, H - 232, "Handover", "observations, baseline context, rule version, notes.", 10.5)
    bullet(c, 48, H - 280, "Export", "text, JSON, clipboard or print-to-PDF. Nothing is transmitted.", 10.5)
    bullet(c, 48, H - 328, "Offline", "installs from the browser and keeps working with no link.", 10.5)
    note(c, 48, 62, "Screenshot: crew handover — the review packet a surgeon receives.")
    shot(c, "handover-desktop.png", 500, 78, 412, 380)
    c.showPage()

    # 7 — boundaries -------------------------------------------------------
    frame(c)
    eyebrow(c, 48, H - 60, "06 / Boundaries and next")
    title(c, 46, H - 96, "What this is not.", 28)
    body(c, 48, H - 132, [
        "Stated because it protects the crew it is designed for:",
    ], size=11, color=MUTED)
    bullet(c, 48, H - 178, "Not a medical device", "no diagnosis, treatment or dosing, no dose estimate, no fitness call.", 10.5)
    bullet(c, 48, H - 226, "Not encrypted", "single-user browser storage; no sync, accounts or multi-crew roles.", 10.5)
    bullet(c, 48, H - 274, "Not long-mission proof", "the archive is four crew on one short flight.", 10.5)

    c.setFillColor(PANEL)
    c.rect(520, H - 300, 392, 190, stroke=0, fill=1)
    eyebrow(c, 544, H - 146, "Next", INK)
    body(c, 544, H - 172, [
        "· Indicator set reviewed with flight surgeons",
        "· On-orbit measurement ingestion",
        "· Multi-crew roles and audited access",
        "· Accessibility and clinical review",
    ], size=10.5, color=MUTED, leading=18)

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(48, 118, "LIVE PROTOTYPE")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 11)
    c.drawString(150, 118, "prohor-rho.vercel.app")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(48, 96, "SOURCE CODE")
    c.setFillColor(TEAL)
    c.setFont("Helvetica", 11)
    c.drawString(150, 96, "github.com/tufayelahmedsuhagcc-dotcom/Proho")
    note(c, 48, 66, "MIT licensed. Independent project. Not NASA software; no NASA endorsement implied.")
    c.showPage()
    c.save()
    print("wrote", os.path.normpath(OUT))

if __name__ == "__main__":
    build()
