import assert from 'node:assert/strict';
import fs from 'node:fs';
import {partKnowledge} from '../lib/assistant-knowledge.ts';
import {filterParts,paintTargets} from '../lib/parts-search.ts';
import {partPlacement} from '../lib/vehicle-spatial.ts';
const catalog=JSON.parse(fs.readFileSync('public/parts-catalog.json','utf8'));
assert.equal(catalog.parts.length,636);assert.deepEqual(partKnowledge,catalog.parts);
assert.equal(new Set(catalog.parts.map((p:any)=>p.id)).size,636);assert.equal(new Set(catalog.parts.map((p:any)=>p.name.toLowerCase())).size,636);
assert(catalog.parts.every((p:any)=>p.name&&p.es&&catalog.categories.some((c:any)=>c.en===p.category)));
assert.equal(catalog.parts.find((p:any)=>p.id==='part-1').name,'Engine assembly');assert.equal(catalog.parts.find((p:any)=>p.id==='part-284').name,'Cavity wax');
assert(filterParts(catalog.parts,'cardán').some((p:any)=>p.name==='Drive shaft'));assert(filterParts(catalog.parts,'cigueñal').some((p:any)=>p.name==='Crankshaft'));assert(filterParts(catalog.parts,'door right front').some((p:any)=>p.name==='Right front door shell'));
assert(filterParts(catalog.parts,'','','paint').length>80);assert(filterParts(catalog.parts,'difuminado','','paint').some((p:any)=>p.kind==='operation'));
const targets=paintTargets(catalog.parts);assert(targets.length>=20);assert(targets.some((p:any)=>p.name==='Roof panel'));
for(const p of catalog.parts){const ref=partPlacement(p,{drive:'AWD'});assert(ref.anchors.every((a:any)=>a.position.every(Number.isFinite)));}
const left=partPlacement(catalog.parts.find((p:any)=>p.name==='Left front door shell'));const right=partPlacement(catalog.parts.find((p:any)=>p.name==='Right front door shell'));assert(left.anchors[0].position[2]<0);assert(right.anchors[0].position[2]>0);
assert.equal(partPlacement(catalog.parts.find((p:any)=>p.name==='Basecoat application')).anchors.length,0,'a process is not an installed physical component');
console.log('PASS: 636 bilingual unique entries, stable IDs, assistant parity, search aliases, paint targets and finite reference locations');
