import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import LocalPartsMedia from '../app/components/LocalPartsMedia';
import PartsFinder from '../app/components/PartsFinder';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('public/parts-catalog.json', 'utf8'));
const vehicle = {year:'2026', make:'Toyota', model:'Camry', vin:'PRIVATE_VIN'};
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {throw Error('Network unavailable');};
try {
  for (const lang of [0, 1]) {
    const output = renderToStaticMarkup(<LocalPartsMedia lang={lang} query={lang ? 'alternador' : 'alternator'} category="" componentIds={['part-77']} vehicle={vehicle} onPhoto={() => {}}/>);
    assert(output.includes('/parts-media/ignition-electrical/part-77/illustration.png'));
    assert(output.includes('2026 Toyota Camry'));
    assert(!output.includes('PRIVATE_VIN'));
    assert(output.includes('CC0-1.0'));
    assert(output.includes(lang ? 'No OEM' : 'Not OEM'));
    assert(output.includes(lang ? 'no verifican compatibilidad por VIN' : 'do not verify VIN fitment'));
    assert(output.includes(lang ? 'Descargar PNG' : 'Download PNG'));
    assert(!output.includes('upload.wikimedia.org'));
    const empty = renderToStaticMarkup(<LocalPartsMedia lang={lang} query="unknown part" category="" componentIds={[]} vehicle={{}} onPhoto={() => {}}/>);
    assert(empty.includes(lang ? 'todavía no incluye un PNG' : 'no included PNG yet'));
    assert(!empty.includes('<img'));
    // Integration: the default finder renders bundled images before any effects/API call.
    const finder = renderToStaticMarkup(<PartsFinder lang={lang} catalog={catalog} vehicles={[]} inventory={[]} orders={[]} makes={[]} commonMakes={[]} requestCatalog={async () => ({})} requestSearch={async () => {throw Error('Internet unavailable');}} onSaveSupplier={async () => ({})} onInventory={() => {}} onUse={() => {}}/>);
    assert(finder.includes('/parts-media/engine/part-6/illustration.png'));
    assert(finder.includes(lang ? 'Biblioteca local de imágenes' : 'Local image library'));
  }
} finally {globalThis.fetch = originalFetch;}
console.log('PASS: EN/ES React rendering, local PNG display, download/attribution, vehicle/VIN separation, empty state and offline finder integration');
