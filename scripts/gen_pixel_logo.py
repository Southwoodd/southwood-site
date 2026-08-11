# -*- coding: utf-8 -*-
"""Generate pixel-square Southwood logos: X, square, circle, triangle."""
from pathlib import Path
from PIL import Image

OUT = Path(r"D:\Southwood\NEW MY WEB DEV\Лого\pixel")
OUT.mkdir(parents=True, exist_ok=True)

# 16x16 grids matching original marks:
# X with right-side wedge, square BR fill, ring, triangle BL fill.

X = [
    "................",
    ".##..........##.",
    ".###........###.",
    "..###......###..",
    "...###....###...",
    "....###..###....",
    ".....###.####...",
    "......######....",
    "......######....",
    ".....###.####...",
    "....###..####...",
    "...###....####..",
    "..###......####.",
    ".###........###.",
    ".##..........##.",
    "................",
]

SQ = [
    "................",
    ".##############.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#..........###.",
    ".#.........####.",
    ".#........#####.",
    ".#.......######.",
    ".##############.",
    "................",
]

CI = [
    "................",
    "......####......",
    "....########....",
    "...###....###...",
    "..##........##..",
    ".##..........##.",
    ".##..........##.",
    ".#............#.",
    ".#............#.",
    ".##..........##.",
    ".##..........##.",
    "..##........##..",
    "...###....###...",
    "....########....",
    "......####......",
    "................",
]

TR = [
    "................",
    ".......##.......",
    "......####......",
    "......#..#......",
    ".....##..##.....",
    ".....#....#.....",
    "....##....##....",
    "....#......#....",
    "...##......##...",
    "...#........#...",
    "..####......##..",
    "..#####.....##..",
    ".#######....##..",
    ".##############.",
    ".##############.",
    "................",
]

GLYPHS = [("x", X), ("square", SQ), ("circle", CI), ("triangle", TR)]


def grid_to_cells(grid):
    cells = []
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == "#":
                cells.append((x, y))
    return cells


def write_svg(path, cells, w, h, color, bg=None, scale=1):
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w * scale}" height="{h * scale}" '
        f'viewBox="0 0 {w} {h}" shape-rendering="crispEdges">'
    ]
    if bg:
        parts.append(f'<rect width="{w}" height="{h}" fill="{bg}"/>')
    for x, y in cells:
        parts.append(f'<rect x="{x}" y="{y}" width="1" height="1" fill="{color}"/>')
    parts.append("</svg>")
    path.write_text("\n".join(parts), encoding="utf-8")


def write_png(path, cells, w, h, color, bg=None, scale=8):
    W, H = w * scale, h * scale
    img = Image.new("RGBA", (W, H), bg if bg else (0, 0, 0, 0))
    px = img.load()
    for x, y in cells:
        x0, y0 = x * scale, y * scale
        for dy in range(scale):
            for dx in range(scale):
                px[x0 + dx, y0 + dy] = color
    img.save(path)


def combine_wordmark(gap=2, pad=1):
    n = len(GLYPHS)
    width = n * 16 + (n - 1) * gap + pad * 2
    height = 16 + pad * 2
    cells = []
    ox = pad
    for _, grid in GLYPHS:
        for x, y in grid_to_cells(grid):
            cells.append((ox + x, pad + y))
        ox += 16 + gap
    return cells, width, height


def mini(grid):
    cells = []
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == "#" and 1 <= x <= 14 and 1 <= y <= 14:
                cells.append((x - 1, y - 1))
    return cells


# Individual glyphs
for name, grid in GLYPHS:
    cells = grid_to_cells(grid)
    write_svg(OUT / f"glyph-{name}-yellow.svg", cells, 16, 16, "#eaff00")
    write_svg(OUT / f"glyph-{name}-cream.svg", cells, 16, 16, "#FAFAEE")
    write_png(OUT / f"glyph-{name}-yellow.png", cells, 16, 16, (234, 255, 0, 255), scale=8)
    write_png(OUT / f"glyph-{name}-cream.png", cells, 16, 16, (250, 250, 238, 255), scale=8)

# Wordmarks
cells, w, h = combine_wordmark(gap=2, pad=1)
write_svg(OUT / "logo-wordmark-yellow.svg", cells, w, h, "#eaff00")
write_svg(OUT / "logo-wordmark-cream.svg", cells, w, h, "#FAFAEE")
write_svg(OUT / "logo-wordmark-yellow-on-black.svg", cells, w, h, "#eaff00", bg="#070707")
write_png(OUT / "logo-wordmark-yellow.png", cells, w, h, (234, 255, 0, 255), scale=8)
write_png(OUT / "logo-wordmark-cream.png", cells, w, h, (250, 250, 238, 255), scale=8)
write_png(
    OUT / "logo-wordmark-yellow-on-black.png",
    cells,
    w,
    h,
    (234, 255, 0, 255),
    bg=(7, 7, 7, 255),
    scale=8,
)

# Favicon 32x32: 2x2 of four glyphs
fav = []
for ox, oy, g in ((1, 1, X), (16, 1, SQ), (1, 16, CI), (16, 16, TR)):
    for x, y in mini(g):
        if ox + x < 31 and oy + y < 31:
            fav.append((ox + x, oy + y))

write_svg(OUT / "favicon-pixel.svg", fav, 32, 32, "#eaff00", bg="#070707")
write_png(OUT / "favicon-pixel.png", fav, 32, 32, (234, 255, 0, 255), bg=(7, 7, 7, 255), scale=1)
write_png(OUT / "favicon-pixel-128.png", fav, 32, 32, (234, 255, 0, 255), bg=(7, 7, 7, 255), scale=4)

# X-only mark for tiny sizes
x_cells = [(x + 8, y + 8) for x, y in grid_to_cells(X)]
write_svg(OUT / "favicon-x.svg", x_cells, 32, 32, "#eaff00", bg="#070707")
write_png(OUT / "favicon-x.png", x_cells, 32, 32, (234, 255, 0, 255), bg=(7, 7, 7, 255), scale=1)

print("OK", OUT)
print("wordmark", w, "x", h)
print("\n".join(sorted(p.name for p in OUT.iterdir())))
