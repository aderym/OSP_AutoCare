import assert from 'node:assert/strict';
import {cameraMarkerTags,isUnderbodyView,layoutMarkerLabels} from '../lib/vehicle-markers.ts';
import {buildVehicleScene} from '../lib/vehicle-scene.ts';
assert(isUnderbodyView(-1.5));assert(isUnderbodyView(-.5));assert(!isUnderbodyView(.9));
const front=cameraMarkerTags({pitch:.32,yaw:-1.57}),rear=cameraMarkerTags({pitch:.32,yaw:1.57}),top=cameraMarkerTags({pitch:1.5,yaw:0}),lower=cameraMarkerTags({pitch:-1.5,yaw:0,group:'body'});
assert(front.length>6);assert(front.includes('frontBumper'));assert(!front.includes('rearLamps'));assert(rear.includes('rearLamps'));assert(!rear.includes('frontLamps'));assert.notDeepEqual(front,rear);assert(top.includes('roof'));
assert(lower.length>15);assert(lower.includes('oilPan')&&lower.includes('uJoint')&&lower.includes('cvAxle'));assert(!lower.includes('roof')&&!lower.includes('hood')&&!lower.includes('alternator'));
for(const type of ['car','suv','truck','van'] as const)for(const drive of ['fwd','rwd','awd'] as const)for(const ev of [false,true]){const scene=buildVehicleScene(type,ev,drive);const tags=lower.filter(t=>scene.some(f=>f.tag===t));assert(tags.length>6);if(ev)assert(!tags.includes('oilPan')&&!tags.includes('exhaust'));if(drive==='fwd')assert(!tags.includes('driveline'));}
console.log('PASS: camera-aware exterior/roof/underbody markers across 24 scene configurations');

const labels=layoutMarkerLabels(Array.from({length:20},()=>({x:120,y:150})),600,400);for(let i=0;i<labels.length;i++){assert(labels[i].x>=22&&labels[i].x<=578&&labels[i].y>=22&&labels[i].y<=358);for(let j=0;j<i;j++)assert(Math.hypot(labels[i].x-labels[j].x,labels[i].y-labels[j].y)>=35);}
