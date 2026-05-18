#!/usr/bin/env python3
"""Generate docs/architecture.svg (system overview banner for README).

Regenerate PNG (after editing this script or architecture-overview.mmd):

  python3 docs/generate_architecture_svg.py
  cd docs && npx --yes @resvg/resvg-js -e "
    const fs=require('fs'); const {Resvg}=require('@resvg/resvg-js');
    const svg=fs.readFileSync('architecture.svg');
    const r=new Resvg(svg,{fitTo:{mode:'width',value:1920}});
    fs.writeFileSync('architecture.png', r.render().asPng());
  "

Or use Mermaid CLI: npx @mermaid-js/mermaid-cli -i docs/architecture-overview.mmd -o docs/architecture.png
"""

from pathlib import Path

OUT = Path(__file__).parent / "architecture.svg"

W, H = 1920, 1080
BG = "#F8FAFC"
FONT = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"

# Colors
INDIGO = "#4F46E5"
INDIGO_BG = "#EEF2FF"
EMERALD = "#059669"
EMERALD_BG = "#ECFDF5"
AMBER = "#D97706"
AMBER_BG = "#FFFBEB"
SLATE = "#475569"
SLATE_BG = "#F1F5F9"
STROKE = "#CBD5E1"
TEXT = "#0F172A"
MUTED = "#64748B"


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def rect(x, y, w, h, fill, stroke=STROKE, rx=12, sw=1.5):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
    )


def text(x, y, s, size=14, weight=600, fill=TEXT, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
        f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{esc(s)}</text>'
    )


def multiline(x, y, lines, size=13, weight=500, fill=TEXT, lh=18):
    parts = []
    for i, line in enumerate(lines):
        parts.append(
            f'<tspan x="{x}" dy="{lh if i else 0}">{esc(line)}</tspan>'
        )
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
        f'font-weight="{weight}" fill="{fill}">{"".join(parts)}</text>'
    )


def arrow(x1, y1, x2, y2, dashed=False, color=SLATE):
    dash = ' stroke-dasharray="6 4"' if dashed else ""
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
        f'stroke-width="2"{dash} marker-end="url(#arrow)"/>'
    )


def label_on_line(x, y, s):
    return text(x, y, s, size=11, weight=500, fill=MUTED, anchor="middle")


def cylinder(x, y, w, h, fill, stroke=AMBER):
  # simple DB cylinder
  ry = h * 0.12
  return (
    f'<ellipse cx="{x + w/2}" cy="{y + ry}" rx="{w/2}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
    f'<rect x="{x}" y="{y + ry}" width="{w}" height="{h - 2*ry}" fill="{fill}" stroke="none"/>'
    f'<line x1="{x}" y1="{y + ry}" x2="{x}" y2="{y + h - ry}" stroke="{stroke}" stroke-width="1.5"/>'
    f'<line x1="{x + w}" y1="{y + ry}" x2="{x + w}" y2="{y + h - ry}" stroke="{stroke}" stroke-width="1.5"/>'
    f'<ellipse cx="{x + w/2}" cy="{y + h - ry}" rx="{w/2}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
  )


parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
    "<defs>",
    '<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">',
    f'<path d="M0,0 L8,3 L0,6 Z" fill="{SLATE}"/>',
    "</marker>",
    '<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">',
    f'<path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" stroke-width="0.5"/>',
    "</pattern>",
    "</defs>",
    f'<rect width="{W}" height="{H}" fill="{BG}"/>',
    f'<rect width="{W}" height="{H}" fill="url(#grid)"/>',
    # Title
    text(W / 2, 56, "In-House Goal Setting & Tracking Portal", size=28, weight=700, anchor="middle"),
    text(
        W / 2,
        88,
        "FastAPI + Next.js 15 + PostgreSQL + Redis  ·  Real-time SSE",
        size=16,
        weight=500,
        fill=MUTED,
        anchor="middle",
    ),
]

# Lane backgrounds
lanes = [
    (40, 120, 400, 880, "CLIENT", INDIGO, INDIGO_BG),
    (460, 120, 400, 880, "EDGE", INDIGO, INDIGO_BG),
    (880, 120, 400, 880, "APPLICATION", EMERALD, EMERALD_BG),
    (1300, 120, 580, 880, "DATA & EXTERNAL", AMBER, AMBER_BG),
]
for x, y, w, h, title, accent, bg in lanes:
    parts.append(rect(x, y, w, h, bg, stroke=accent, rx=16))
    parts.append(text(x + 20, y + 36, title, size=13, weight=700, fill=accent))

# Client boxes
parts.append(rect(70, 200, 340, 72, "#FFFFFF", stroke=INDIGO))
parts.append(text(90, 232, "Browser", size=16, weight=700))
parts.append(text(90, 256, "User session + UI", size=12, weight=500, fill=MUTED))

parts.append(rect(70, 300, 340, 100, "#FFFFFF", stroke=INDIGO))
parts.append(multiline(90, 340, ["Next.js 15 App", "(React, Tailwind, SWR)"], size=14))

# Edge boxes
ex, ey = 490, 200
for i, (title, sub) in enumerate(
    [
        ("NextAuth", "/api/auth/*"),
        ("SSE proxy", "/api/events/stream"),
        ("URL rewrite", "/api/v1/* → backend"),
    ]
):
    by = ey + i * 110
    parts.append(rect(ex, by, 340, 88, "#FFFFFF", stroke=INDIGO))
    parts.append(text(ex + 20, by + 36, title, size=15, weight=700))
    parts.append(text(ex + 20, by + 58, sub, size=12, weight=500, fill=MUTED))

parts.append(text(ex + 20, 560, "Next.js server :3000", size=12, weight=600, fill=INDIGO))

# Backend boxes
bx, by0 = 910, 200
backend_items = [
    ("REST routers", "/api/v1/*"),
    ("Auth + RBAC", "JWT dependencies"),
    ("Domain services", "goal · checkin · achievement"),
    ("Event bus", "Redis publish"),
    ("APScheduler", "hourly escalations"),
]
for i, (title, sub) in enumerate(backend_items):
    by = by0 + i * 92
    parts.append(rect(bx, by, 340, 76, "#FFFFFF", stroke=EMERALD))
    parts.append(text(bx + 20, by + 32, title, size=14, weight=700))
    parts.append(text(bx + 20, by + 52, sub, size=11, weight=500, fill=MUTED))

parts.append(text(bx + 20, 680, "FastAPI :8000", size=12, weight=600, fill=EMERALD))

# Data cylinders
parts.append(cylinder(1330, 220, 200, 100, AMBER_BG, AMBER))
parts.append(text(1430, 265, "PostgreSQL 16", size=14, weight=700, anchor="middle"))
parts.append(text(1430, 288, "core schema", size=11, weight=500, fill=MUTED, anchor="middle"))

parts.append(cylinder(1330, 360, 200, 100, AMBER_BG, AMBER))
parts.append(text(1430, 405, "Redis 7", size=14, weight=700, anchor="middle"))
parts.append(text(1430, 428, "pub/sub channels", size=11, weight=500, fill=MUTED, anchor="middle"))

# External
parts.append(rect(1330, 520, 520, 200, SLATE_BG, stroke=SLATE, rx=12))
parts.append(text(1350, 548, "External (optional)", size=12, weight=700, fill=SLATE))
for i, name in enumerate(["Microsoft Entra ID", "SendGrid", "MS Teams webhook"]):
    oy = 580 + i * 44
    parts.append(rect(1350, oy, 480, 36, "#FFFFFF", stroke=SLATE, rx=8))
    parts.append(text(1368, oy + 24, name, size=13, weight=600, fill=SLATE))

# Arrows (approximate centers)
parts.append(arrow(410, 236, 490, 236))  # browser -> edge
parts.append(arrow(830, 280, 910, 280))  # edge -> api
parts.append(arrow(1080, 520, 1330, 270))  # api -> pg
parts.append(arrow(1080, 540, 1330, 410))  # api -> redis
parts.append(arrow(1250, 300, 1250, 520, dashed=True))  # to external

label_on_line(450, 222, "axios / NextAuth / SSE")
label_on_line(870, 266, "REST + JWT")
label_on_line(1200, 380, "SQLAlchemy + pub/sub")

parts.append(text(W - 40, H - 28, "v0.1.0 · MIT", size=12, weight=500, fill=MUTED, anchor="end"))
parts.append("</svg>")

OUT.write_text("\n".join(parts), encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")
