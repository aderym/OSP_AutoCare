import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {localPartMedia, searchLocalPartMedia, localMediaForComponent, mediaVehicleLabel} from '../lib/parts-media.ts';

const catalog = JSON.parse(fs.readFileSync('public/parts-catalog.json', 'utf8')) as {parts: {id: string; category: string; name: string; es: string; aliases?: string[]}[]; categories: {en: string; es: string}[]};
assert.equal(localPartMedia.length, 30);
assert.equal(new Set(localPartMedia.map(item => item.category)).size, catalog.categories.length);
assert.equal(new Set(localPartMedia.map(item => item.id)).size, localPartMedia.length);
for (const media of localPartMedia) {
  const part = catalog.parts.find((part) => part.id === media.componentId);
  assert(part, `Orphan reference ${media.componentId}`);
  assert.equal(part.category, media.category);
  assert.equal(part.name, media.name);
  assert.equal(part.es, media.es);
  assert.deepEqual(part.aliases || [], media.aliases);
  assert.equal(media.provenance, 'original');
  assert.equal(media.license, 'CC0-1.0');
  assert(media.artist && media.licenseUrl);
  assert.equal(media.oem, false);
  assert.equal(media.fitment, 'unverified');
  assert.equal(media.vehicleScope, 'generic');
  assert.match(media.image, /^\/parts-media\/[a-z-]+\/part-\d+\/(illustration|diagram)\.png$/);
  const png = fs.readFileSync('public' + media.image);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 640);
  assert.equal(png.readUInt32BE(20), media.kind === 'diagram' ? 490 : 400);
  assert.equal(createHash('sha256').update(png).digest('hex'), media.sha256);
  const source = fs.readFileSync(media.source, 'utf8');
  assert(source.includes('No VIN fitment') && source.includes('No OEM'));
  for (const kind of ['illustration', 'diagram']) {
    assert(localMediaForComponent(part.id).some(item => item.kind === kind));
  }
}
for (const query of ['Alternator', 'alternador', 'ALTERNADOR']) {
  assert.deepEqual(searchLocalPartMedia(query).map(item => item.componentId), ['part-77', 'part-77']);
}
assert.equal(searchLocalPartMedia('cardán')[0].componentId, 'part-118');
assert.equal(searchLocalPartMedia('culata de aceite')[0].componentId, 'part-12');
assert.equal(searchLocalPartMedia('cárter')[0].componentId, 'part-12');
assert.equal(searchLocalPartMedia('oil pan', {kind: 'diagram'}).length, 1);
assert.equal(searchLocalPartMedia('', {category: 'Cooling'}).length, 2);
assert.equal(searchLocalPartMedia('alternator', {category: 'Cooling'}).length, 0);
assert.equal(searchLocalPartMedia('', {componentIds: []}).length, 0);
assert.equal(searchLocalPartMedia('', {componentIds: ['part-77'], kind: 'diagram'}).length, 1);
assert.equal(searchLocalPartMedia('imaginary-part-123').length, 0);
assert.equal(searchLocalPartMedia('9091520004').length, 0, 'Do not imply an OEM number match');
const vehicle = {year:'2026', make:'Toyota', model:'Camry', vin:'PRIVATE_VIN'};
assert.equal(mediaVehicleLabel(vehicle), '2026 Toyota Camry');
// The included library remains usable with every network call disabled.
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {throw Error('Network unavailable');};
try {assert.equal(searchLocalPartMedia('alternador').length, 2);} finally {globalThis.fetch = originalFetch;}
console.log('PASS: 30 valid PNGs, 14 systems, stable component links, provenance, hashes, EN/ES/aliases, filters, private vehicle context and offline lookup');
