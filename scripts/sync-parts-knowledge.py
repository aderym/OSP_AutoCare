#!/usr/bin/env python3
"""Keep server-side assistant search aligned with the public parts catalog."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parts=json.loads((root/'public/parts-catalog.json').read_text())['parts']
assert len({p['id'] for p in parts})==len(parts)
assert all(p.get('name') and p.get('es') and p.get('category') for p in parts)
p=root/'lib/assistant-knowledge.ts'
prefix=p.read_text().split('export const partKnowledge=')[0]
p.write_text(prefix+'export const partKnowledge='+json.dumps(parts,ensure_ascii=False)+';\n')
print(f'Synchronized {len(parts)} bilingual entries')
