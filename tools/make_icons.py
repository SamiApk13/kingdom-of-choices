#!/usr/bin/env python3
"""تولید آیکون‌های برنامه (تاج طلایی روی زمینه تیره) برای PWA/Android."""
from PIL import Image, ImageDraw

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (13, 10, 6, 255))
    d = ImageDraw.Draw(img)
    pad = size * (0.28 if maskable else 0.16)
    w = size - 2 * pad
    cx = size / 2
    # بدنه تاج
    base_y = size - pad
    top_y = pad + w * 0.08
    pts = [
        (pad, base_y - w * 0.12),
        (pad - w * 0.06, pad + w * 0.22),
        (pad + w * 0.22, pad + w * 0.42),
        (cx, top_y),
        (size - pad - w * 0.22, pad + w * 0.42),
        (size - pad + w * 0.06, pad + w * 0.22),
        (size - pad, base_y - w * 0.12),
    ]
    gold = (201, 162, 39, 255)
    gold_light = (232, 207, 122, 255)
    d.polygon(pts, fill=gold)
    d.rectangle([pad, base_y - w * 0.12, size - pad, base_y], fill=gold_light)
    # جواهرات
    gem = (168, 50, 50, 255)
    r = w * 0.045
    for fx in (0.25, 0.5, 0.75):
        x = pad + w * fx
        y = base_y - w * 0.06
        d.ellipse([x - r, y - r, x + r, y + r], fill=gem)
    # هاله ملایم پشت تاج
    return img

if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "www", "icons")
    os.makedirs(out, exist_ok=True)
    make_icon(192).save(os.path.join(out, "icon-192.png"))
    make_icon(512).save(os.path.join(out, "icon-512.png"))
    make_icon(512, maskable=True).save(os.path.join(out, "icon-maskable-512.png"))
    print("icons generated in www/icons")
