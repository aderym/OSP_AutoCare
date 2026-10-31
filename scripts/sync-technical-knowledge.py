#!/usr/bin/env python3
"""Keep assistant resource search aligned with the public technical directory."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'public/technical-resources.json').read_text())
resources=data['resources']
assert len({r['id'] for r in resources})==len(resources)
assert all(r['category'] in {c['id'] for c in data['categories']} for r in resources)
assert all(r['url'].startswith('https://') and r.get('description') and r.get('es') for r in resources)
p=root/'lib/assistant-knowledge.ts'
suffix=p.read_text().split('export const partKnowledge=',1)[1]
p.write_text('export const resourceKnowledge='+json.dumps(resources,ensure_ascii=False)+';\nexport const partKnowledge='+suffix)
print(f'Synchronized {len(resources)} technical resources')
