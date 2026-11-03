"""Render generated SVG model assets to transparent WebP images. Requires cairosvg and Pillow."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from io import BytesIO
import json
import argparse
import cairosvg
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'public/part-drawings/manifest.json').read_text())
models = {entry['modelKey']: entry for entry in manifest['entries']}
parser = argparse.ArgumentParser()
parser.add_argument('--only-missing', action='store_true', help='Reuse already verified raster assets for unchanged model keys')
args = parser.parse_args()
if args.only_missing:
    pending = {}
    for key, entry in models.items():
        try:
            for field in ['image', 'thumbnail']:
                with Image.open(root / ('public' + entry[field])) as previous:
                    previous.load()
                    assert previous.convert('RGBA').getextrema()[3][0] == 0
        except Exception:
            pending[key] = entry
    models = pending

def save_webp(image, destination, quality):
    buffer = BytesIO()
    image.save(buffer, format='WEBP', quality=quality, method=6)
    encoded = buffer.getvalue()
    assert len(encoded) > 32, 'Empty render: ' + str(destination)
    with Image.open(BytesIO(encoded)) as verify:
        verify.load()
    temporary = destination.with_suffix(destination.suffix + '.tmp')
    temporary.write_bytes(encoded)
    temporary.replace(destination)
    assert destination.stat().st_size == len(encoded)

def render(entry):
    svg = root / ('public' + entry['vector'])
    data = cairosvg.svg2png(url=str(svg), output_width=1440, output_height=1050)
    image = Image.open(BytesIO(data)).convert('RGBA')
    assert image.getextrema()[3][0] == 0, 'Missing alpha: ' + entry['name']
    save_webp(image, root / ('public' + entry['image']), 91)
    image.thumbnail((240, 175), Image.Resampling.LANCZOS)
    save_webp(image, root / ('public' + entry['thumbnail']), 88)
    return entry['modelKey']
with ThreadPoolExecutor(max_workers=4) as pool:
    for index, key in enumerate(pool.map(render, models.values()), start=1):
        if index % 20 == 0:
            print(f'{index}/{len(models)} models rendered', flush=True)
print(f'PASS: {len(models)} shaded models rendered with transparent alpha for {len(manifest["entries"])} catalog entries')
