import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildVehicleScene,pointInPolygon,project3D} from '../lib/vehicle-scene.ts';
import {buildComponentPreview} from '../lib/vehicle-component.ts';
import {meshBuilder} from '../lib/vehicle-geometry.ts';
import {inferDriveLayout,showUnderbodyFace} from '../lib/vehicle-underbody.ts';
import {bodyDimensions} from '../lib/vehicle-body.ts';
import {partPlacement} from '../lib/vehicle-spatial.ts';
const {parts}=JSON.parse(readFileSync(new URL('../public/parts-catalog.json',import.meta.url),'utf8'));
for(const type of ['car','suv','truck','van'] as const)for(const ev of [false,true]){
 const faces=buildVehicleScene(type,ev);assert(faces.length>2000);assert(faces.length<20000);
 for(const face of faces){assert(face.points.length>=3);assert(face.points.flat().every(Number.isFinite));}
 assert(faces.some(f=>f.tag==='roof'));assert(faces.some(f=>f.tag==='brakes'));assert(faces.some(f=>f.tag===(ev?'driveMotor':'engine')));assert.equal(faces.some(f=>f.tag==='engine'),!ev);
 const points=faces.filter(f=>f.tag==='roof').flatMap(f=>f.points);const height=Math.max(...points.map(p=>p[1]));assert(height>=(type==='van'?1.89:type==='suv'?1.64:type==='truck'?1.69:1.44));
}
assert(bodyDimensions.suv.rear<bodyDimensions.suv.rearBase-1);
const curved=buildVehicleScene('suv').filter(f=>f.tag==='body'&&f.kind==='body').flatMap(f=>f.points);
assert(new Set(curved.map(p=>p[2].toFixed(3))).size>40,'Curved side widths instead of slab sides');
const m=meshBuilder();m.cylinder([0,0,0],1,.1,'#ffffff','test','x');const pts=m.faces.flatMap(f=>f.points);assert(Math.max(...pts.map(p=>Math.abs(p[0])))<.051);assert(Math.max(...pts.map(p=>p[1]))>.99);assert(Math.max(...pts.map(p=>p[2]))>.99);
for(const name of ['Engine assembly','Piston','Spark plug','Engine oil filter','Front brake pad set','Front strut','Alternator','Brake rotor','Roof panel','Front door shell','High voltage battery']){
 const part=parts.find((p:any)=>p.name===name);assert(part,name);const placement=partPlacement(part);const preview=buildComponentPreview(part,placement.tag,'suv',name==='High voltage battery');assert(preview.faces.length>0,name);assert(preview.faces.every(f=>f.points.flat().every(Number.isFinite)),name);const pp=preview.faces.flatMap(f=>f.points);const extent=[0,1,2].map(i=>Math.max(...pp.map(p=>p[i]))-Math.min(...pp.map(p=>p[i])));assert(Math.abs(Math.max(...extent)-2.8)<.001,name);
 if(['Piston','Spark plug','Engine oil filter'].includes(name))assert.equal(preview.specific,true,name);
}
for(const name of ['Valve cover gasket','Piston ring set','Spark plug wire set'])assert.equal(buildComponentPreview({name},'engine','car',false).specific,false,name);
assert.equal(buildComponentPreview({name:'Strut mount'},'suspension','car',false).specific,false);
assert(pointInPolygon(1,1,[{x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2}]));assert(!pointInPolygon(3,1,[{x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2}]));
const a=project3D([1,1,0],{yaw:0,pitch:.4,zoom:1},800,450),b=project3D([1,1,0],{yaw:1,pitch:.4,zoom:1},800,450);assert.notEqual(a.x,b.x);
console.log('PASS: four contemporary bodies, electric/combustion geometry, cylinder axes, isolated part fitting, component/assembly labels, polygon picking and rotation.');

// Lift-view regressions: the floor must sit above the visible driveline, never cover it.
const awd=buildVehicleScene('suv',false,'awd'),lower=awd.filter(f=>showUnderbodyFace(f.tag,f.kind));
for(const tag of ['oilPan','transmission','transferCase','driveline','uJoint','cvAxle','differential','exhaust','fuelTank','brakeLines'])assert(lower.some(f=>f.tag===tag),tag);
assert(!lower.some(f=>['roof','hood','doors','interior','dashboard'].includes(f.tag)));
const floorMin=Math.min(...awd.filter(f=>f.tag==='floorPan').flatMap(f=>f.points.map(p=>p[1])));
const shaftMax=Math.max(...awd.filter(f=>f.tag==='driveline').flatMap(f=>f.points.map(p=>p[1])));assert(floorMin>shaftMax);
const fwd=buildVehicleScene('car',false,'fwd');assert(!fwd.some(f=>['driveline','uJoint','transferCase','differential'].includes(f.tag)));
const electric=buildVehicleScene('suv',true,'awd');assert(!electric.some(f=>['oilPan','transmission','driveline','uJoint','fuelTank','fuelLines','exhaust','muffler'].includes(f.tag)));assert(electric.some(f=>f.tag==='hvBattery'));
assert.equal(inferDriveLayout({drive:'Front-Wheel Drive'}).layout,'fwd');assert.equal(inferDriveLayout({drive:'Rear-Wheel Drive'}).layout,'rwd');assert.equal(inferDriveLayout({drive:'4-Wheel Drive'}).layout,'awd');assert(inferDriveLayout({}).estimated);
assert.equal(partPlacement({name:'Oil pan',category:'Engine'}).tag,'oilPan');assert.equal(partPlacement({name:'U-joint'}).tag,'uJoint');assert.equal(partPlacement({name:'CV axle'},{drive:'FWD'}).anchors.length,2);assert.equal(partPlacement({name:'CV axle'},{drive:'AWD'}).anchors.length,4);
for(const [name,tag]of [['Oil pan','oilPan'],['U-joint','uJoint'],['CV axle','cvAxle'],['Drive shaft','driveline'],['Differential','differential']]){const preview=buildComponentPreview({name},tag,'suv',false);assert(preview.faces.length>50,name);assert(preview.specific,name);assert(preview.faces.every(f=>f.points.flat().every(Number.isFinite)));}
console.log('PASS: underbody visibility, floor clearance, FWD/RWD/AWD layouts, EV exclusions and isolated driveline components.');
