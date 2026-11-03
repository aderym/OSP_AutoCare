import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import ComponentDrawing from '../app/components/ComponentDrawing';
import VehiclePartsBrowser from '../app/components/VehiclePartsBrowser';
import {componentDrawingFamily,componentDrawingPath,componentImagePath,componentShapes} from '../lib/part-illustrations';
const catalog=JSON.parse(fs.readFileSync('public/parts-catalog.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/part-drawings/manifest.json','utf8'));
assert.equal(manifest.entries.length,catalog.parts.length);
for(const part of catalog.parts){
 const family=componentDrawingFamily(part);assert(componentShapes[family],part.name);
 const svg=fs.readFileSync('public'+componentDrawingPath(part),'utf8');
 assert(svg.includes('<path'));assert(svg.includes('shaded perspective'));const entry=manifest.entries.find((e:any)=>e.componentId===part.id);assert(entry.faceCount>=20,part.name+' must have modeled surfaces');assert.equal(entry.style,'shaded-perspective-3d');assert(fs.existsSync('public'+componentImagePath(part)));assert(fs.existsSync('public'+componentImagePath(part,true)));
 assert(!svg.includes('<rect'));assert(!svg.includes('<image'));assert(!svg.includes('undefined'));assert(!svg.includes('NaN'));
 for(const lang of [0,1]){const html=renderToStaticMarkup(<ComponentDrawing part={part} lang={lang}/>);assert(html.includes(componentImagePath(part)));assert(html.includes(lang?'dibujo general':'generic component'));}
}
// Semantically distinct cases must not inherit a parent assembly or misleading mechanical form.
for(const [name,family] of [['Catalytic converter','catalyst'],['Torque converter','clutch'],['Rust converter','can'],['Brake fluid','bottle'],['Head gasket','headgasket'],['Windshield adhesive','tube'],['A/C condenser fan','fan'],['Timing chain guide','guide'],['Brake shoe set','shoe'],['Seat belt retractor','seatbelt'],['Front bumper cover','bumper'],['Differential drain plug','bolt'],['Inverter coolant pump','pump'],['Windshield molding','molding'],['Block sanding','process']]){
 const part=catalog.parts.find((p:any)=>p.name===name);assert(part,name);assert.equal(componentDrawingFamily(part),family,name);
}
for(const lang of [0,1]){const html=renderToStaticMarkup(<VehiclePartsBrowser lang={lang} catalog={catalog} category="Brakes" vehicle={{make:'Toyota',model:'Camry',year:'2024'}} onVehicle={()=>{}} onCategory={()=>{}} onPart={()=>{}}/>);for(const part of catalog.parts.filter((p:any)=>p.category==='Brakes'))assert(html.includes(componentImagePath(part,true)));assert(html.includes(lang?'Componente seleccionado':'Selected component'));}
const engine=manifest.entries.find((e:any)=>e.name==='Engine assembly');assert(engine.faceCount>500,'Engine cannot be a box icon');
console.log('PASS: all '+catalog.parts.length+' catalog entries have transparent local SVGs, EN/ES rendering, complete brake thumbnails and correct special-case families');
