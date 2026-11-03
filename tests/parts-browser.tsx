import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {vehicleModels,vehicleYears,changePartsVehicle} from '../lib/parts-browser';
import {partsAssemblies} from '../lib/parts-assemblies';
import PartsAssemblyDiagram from '../app/components/PartsAssemblyDiagram';
import VehiclePartsBrowser from '../app/components/VehiclePartsBrowser';
const index=JSON.parse(fs.readFileSync('public/parts-vehicle-index.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('public/parts-catalog.json','utf8'));
assert.equal(Object.keys(index).length,145);
assert(vehicleModels(index,'TOYOTA').includes('Camry'));
assert(vehicleYears(index,'Toyota','Camry').includes('2024'));
assert.deepEqual(vehicleYears(index,'unknown','unknown'),[]);
const sourceYears=new Map<string,any>();
for(const [make,entry] of Object.entries(index) as any){for(const [model,years] of Object.entries(entry.models) as any){for(const year of years){if(!sourceYears.has(year))sourceYears.set(year,JSON.parse(fs.readFileSync('public/vehicle-catalog/'+year+'.json','utf8')));const source=sourceYears.get(year);assert(source[make]?.models[model]);}}}
const changed=changePartsVehicle({make:'Toyota',model:'Camry',year:'2026',vin:'PRIVATE',engine:'OLD',epaId:'123'},'make','Ford');
assert.equal(changed.model,'');assert.equal(changed.year,'');assert.equal(changed.vin,'');assert.equal(changed.epaId,'');
assert.equal(changePartsVehicle({make:'Toyota',model:'Camry',year:'2026'},'model','Corolla').year,'');
for(const category of catalog.categories){
 assert(partsAssemblies[category.en]?.length>=3);
 const parts=catalog.parts.filter((p:any)=>p.category===category.en);
 for(const piece of partsAssemblies[category.en]) assert(parts.some((p:any)=>p.name.toLowerCase()===piece.name.toLowerCase()),category.en+': '+piece.name+' must resolve to a selectable part');
 const svg=renderToStaticMarkup(<PartsAssemblyDiagram category={category.en} parts={parts} onPart={()=>{}}/>);
 assert(!svg.includes('<rect'));assert(svg.includes('role="button"'));assert(svg.includes('tabindex="0"'));
}
for(const lang of [0,1]){
 const html=renderToStaticMarkup(<VehiclePartsBrowser lang={lang} catalog={catalog} vehicle={{make:'Toyota',model:'Camry',year:'2026'}} category="Engine" onVehicle={()=>{}} onCategory={()=>{}} onPart={()=>{}}/>);
 assert(html.includes(lang?'Motor completo':'Engine assembly'));assert(html.includes(lang?'SVG sin fondo':'Transparent SVG'));assert(!html.includes('PRIVATE'));
}
console.log('PASS vehicle index matches all year catalogs, dependent resets, 14 transparent selectable assemblies and EN/ES rendering');
