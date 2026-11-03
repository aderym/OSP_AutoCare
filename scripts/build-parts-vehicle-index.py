"""Build the make → model → years index from the bundled vehicle catalogs."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'public/vehicle-catalog'
meta = json.loads((source / 'index.json').read_text())
names = {name.lower(): name for values in meta['makesByYear'].values() for name in values}
index = {}
for path in sorted(source.glob('[12][0-9][0-9][0-9].json')):
    for key, entry in json.loads(path.read_text()).items():
        brand = index.setdefault(key, {'name': names.get(key, key.title()), 'models': {}})
        for model in entry['models']:
            brand['models'].setdefault(model, []).append(path.stem)
(root / 'public/parts-vehicle-index.json').write_text(json.dumps(index, separators=(',', ':')) + '\n')
print(f"{len(index)} makes; {sum(len(brand['models']) for brand in index.values())} models")
