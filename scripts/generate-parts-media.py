#!/usr/bin/env python3
"""Render original, generic component reference art. Requires Python 3 and Node with sharp (included by Next.js).
Run from repository root. Never downloads images or connects to a database.
SVG geometry is schematic: no dimensions, OEM provenance or fitment claims.
"""
import hashlib
import html
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]

def shape(kind):
    drawings = {
        'piston': '<ellipse cx="310" cy="125" rx="75" ry="23"/><path d="M235 125v135q75 40 150 0V125M235 148q75 35 150 0M235 163q75 35 150 0M235 178q75 35 150 0"/><ellipse cx="330" cy="235" rx="22" ry="26" fill="#fff"/>',
        'pan': '<path d="M185 125h235l20 30-40 125H235l-50-125z"/><path d="M185 125l20 30h235M205 155l30 125M235 280l20-100h135l10 100"/><path d="M400 255h22v20h-22z" fill="#e7b942"/>',
        'radiator': '<rect x="200" y="120" width="220" height="165" rx="8"/><path d="M225 120v165M395 120v165M200 135h-35v-25h35M420 255h35v25h-35"/>'+''.join(f'<path d="M230 {y}h160"/>' for y in range(135,280,12)),
        'injector': '<path d="M295 95h30v45h15v100l-18 35v20h-24v-20l-18-35V140h15z"/><path d="M340 150h48v25h-48M280 160h60M280 230h60M298 285h24"/><path d="M296 120h28" stroke="#e7b942" stroke-width="10"/>',
        'alternator': '<path d="M250 140l30-30h75l50 50v90l-45 30h-90l-25-35z"/><ellipse cx="285" cy="205" rx="70" ry="75"/><ellipse cx="235" cy="205" rx="42" ry="48"/><ellipse cx="200" cy="205" rx="20" ry="34" fill="#e7b942"/><path d="M375 250h30v35h-30z"/>'+''.join(f'<path d="M{x} 160v80"/>' for x in range(300,375,15)),
        'catalyst': '<path d="M140 190h70l45-40h110l45 40h70v30h-70l-45 40H255l-45-40h-70z"/><path d="M255 150v110M365 150v110M270 170h80v70h-80z"/>'+''.join(f'<path d="M{x} 170v70"/>' for x in range(280,350,10)),
        'shaft': '<path d="M200 185h220v30H200zM155 170h25v20h20v20h-20v20h-25zM420 185h20v-20h25v70h-25v-20h-20z"/><path d="M170 200h30M440 200h25" stroke="#e7b942" stroke-width="12"/>',
        'strut': '<path d="M265 100h90v20h-90zM300 120h20v150h-20zM285 225h50v65h-50zM285 290h65v20h-65z"/><path d="M270 140l80 15-80 15 80 15-80 15 80 15-80 15" fill="none" stroke="#e7b942" stroke-width="8"/>',
        'rotor': '<circle cx="310" cy="205" r="100"/><circle cx="310" cy="205" r="65" fill="#fff"/><circle cx="310" cy="205" r="25" fill="#fff"/>'+''.join(f'<circle cx="{x}" cy="{y}" r="8" fill="#e7b942"/>' for x,y in [(310,155),(358,190),(340,245),(280,245),(262,190)]),
        'compressor': '<rect x="245" y="150" width="150" height="115" rx="28"/><ellipse cx="245" cy="207" rx="40" ry="58"/><ellipse cx="195" cy="207" rx="22" ry="50" fill="#e7b942"/><path d="M215 157l-20 0v100h20M335 150v-30h20v30M365 150v-30h20v30M280 265v20h30v-20M365 265v20h25v-20"/>',
        'bumper': '<path d="M145 145l75-25h180l75 25-15 125-75 15H235l-75-15z"/><path d="M225 200h170l-15 55H240z" fill="#fff"/><path d="M170 145h25v20h-25zM425 145h25v20h-25zM175 210h30v35h-30zM415 210h30v35h-30z"/>',
        'belt': '<rect x="175" y="230" width="60" height="65" rx="12"/><path d="M195 230l90-125 20 15-90 120M285 105l130 90-14 20-116-85"/><path d="M400 195h35v40h-35zM410 205h15v15h-15z" fill="#e7b942"/>',
        'filter': '<path d="M250 120v140q60 45 120 0V120"/><ellipse cx="310" cy="120" rx="60" ry="25"/><ellipse cx="310" cy="120" rx="45" ry="17" fill="#e7b942"/><ellipse cx="310" cy="120" rx="13" ry="9" fill="#fff"/><path d="M270 165v70M290 165v70M310 165v70M330 165v70M350 165v70"/>',
        'battery': '<rect x="170" y="135" width="270" height="140" rx="12"/><path d="M440 200h25v30h-25" fill="#e7b942"/>'+''.join(f'<rect x="{x}" y="{y}" width="65" height="40" rx="4"/>' for x in [185,265,345] for y in [150,210]),
        'spray': '<path d="M275 95h70v65h-70zM295 160v30h30v-30M255 190h140v30h-60l-20 80h-35l15-80h-40z"/><path d="M395 190h25v30h-25M335 220v35h-12M275 285h40" fill="#e7b942"/>',
    }
    return drawings[kind]

def main():
    catalog = json.loads((ROOT/'public/parts-catalog.json').read_text())
    definitions = json.loads((ROOT/'assets/parts-media/components.json').read_text())
    parts = {p['id']: p for p in catalog['parts']}
    media = []
    for definition in definitions:
        p = parts[definition['componentId']]
        for kind in ['illustration', 'diagram']:
            relative = f"parts-media/{definition['system']}/{p['id']}/{kind}"
            target = ROOT/'public'/f'{relative}.png'
            source = ROOT/'assets'/f'{relative}.svg'
            title = html.escape(p['name']+' / '+p['es'])
            annotations = ''
            if kind == 'diagram':
                for n, (en, es, x, y) in enumerate(definition['labels'], 1):
                    # Fixed numbered legend avoids ambiguous translated labels on the geometry.
                    annotations += f'<circle cx="{x}" cy="{y}" r="13" fill="#18344a" stroke="#fff"/><text x="{x}" y="{y+5}" text-anchor="middle" fill="#fff" font-size="14">{n}</text>'
                    annotations += f'<text x="28" y="{350+n*23}" font-size="16" fill="#18344a">{n}. {html.escape(en+" / "+es)}</text>'
            footer_y = 460 if kind == 'diagram' else 365
            height = 490 if kind == 'diagram' else 400
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}">
<rect width="640" height="{height}" fill="#f5f8fa"/>
<g font-family="DejaVu Sans, sans-serif"><text x="28" y="32" font-size="16" fill="#18344a">{title}</text>
<text x="28" y="57" font-size="12" fill="#426076">OSP AutoCare · {'ANNOTATED SCHEMATIC / ESQUEMA ANOTADO' if kind=='diagram' else 'COMPONENT ILLUSTRATION / ILUSTRACIÓN'}</text>
<g stroke="#18344a" stroke-width="3" stroke-linejoin="round" fill="#aedbd9">{shape(definition['drawing'])}</g>
{annotations}<text x="28" y="{footer_y}" font-size="12" fill="#426076">Generic reference · Not OEM · Not to scale · No VIN fitment</text>
<text x="28" y="{footer_y+18}" font-size="12" fill="#426076">Referencia genérica · No OEM · Sin escala · No confirma ajuste por VIN</text></g></svg>'''
            source.parent.mkdir(parents=True, exist_ok=True)
            target.parent.mkdir(parents=True, exist_ok=True)
            source.write_text(svg)
            subprocess.run(['node', '--input-type=module', '-e', "import {createRequire} from 'node:module'; const sharp=createRequire(import.meta.resolve('next/package.json'))('sharp'); await sharp(process.argv[1]).png().toFile(process.argv[2]);", str(source), str(target)], cwd=ROOT, check=True)
            media.append(dict(id=f"{p['id']}-{kind}",componentId=p['id'],system=definition['system'],category=p['category'],
                              name=p['name'],es=p['es'],aliases=p.get('aliases',[]),kind=kind,
                              image='/'+relative+'.png',source=source.relative_to(ROOT).as_posix(),
                              provenance='original',artist='OSP AutoCare',license='CC0-1.0',licenseUrl='https://creativecommons.org/publicdomain/zero/1.0/',
                              oem=False,fitment='unverified',vehicleScope='generic',
                              sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
    (ROOT/'public/parts-media/manifest.json').write_text(json.dumps({'version':1,'media':media},ensure_ascii=False,indent=2)+'\n')
    print(f'Rendered {len(media)} PNGs for {len(definitions)} components.')

if __name__ == '__main__':
    main()
