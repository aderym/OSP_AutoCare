// Camera-aware assembly references. Filter against actual scene tags before rendering.
export const UNDERBODY_PITCH=-.28;
export function isUnderbodyView(pitch:number){return pitch<UNDERBODY_PITCH;}
export function cameraMarkerTags({pitch,yaw,group='auto',xray=false,ev=false}:{pitch:number,yaw:number,group?:string,xray?:boolean,ev?:boolean}){
 if(isUnderbodyView(pitch))return ['oilPan','transmission','transferCase','driveline','uJoint','cvAxle','differential','steering','suspension','brakes','wheels','catalyst','exhaust','muffler','fuelTank','brakeLines','fuelLines','parkingBrake','underbody','floorPan','driveMotor','hvBattery'];
 if(group==='mechanical'||(group==='auto'&&xray))return ev?['driveMotor','radiator','condenser','fan','battery','hvBattery','cvAxle','brakes','suspension','steering','hvac','electrical']:['engine','radiator','condenser','fan','alternator','battery','starter','accessories','brakeHydraulics','electrical','transmission','suspension','brakes'];
 if(group==='body')return ['hood','frontBumper','rearBumper','frontLamps','rearLamps','doors','roof','windshield','rearBody','body','wheels'];
 if(pitch>.85)return ['roof','hood','windshield','rearBody','doors','body','frontLamps','rearLamps','wheels'];
 const front=-Math.sin(yaw);
 return front>.35?['hood','frontBumper','frontLamps','windshield','doors','body','wheels','brakes','roof','rearBody']:front<-.35?['rearBody','rearBumper','rearLamps','roof','doors','body','wheels','brakes','windshield']:['doors','body','wheels','brakes','roof','hood','windshield','rearBody','frontLamps','rearLamps','frontBumper','rearBumper'];
}
/** Move overlapping label buttons apart; leader lines retain the true projected location. */
export function layoutMarkerLabels(points:{x:number,y:number}[],width:number,height:number){
 const placed:{x:number,y:number}[]=[];const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
 for(const p of points){let best={x:clamp(p.x,22,width-22),y:clamp(p.y,22,height-42)},found=false;
 for(let ring=0;ring<=9&&!found;ring++)for(let j=0;j<(ring?12:1);j++){const a=j*Math.PI/6,candidate={x:clamp(p.x+Math.cos(a)*ring*36,22,width-22),y:clamp(p.y+Math.sin(a)*ring*36,22,height-42)};if(placed.every(q=>Math.hypot(q.x-candidate.x,q.y-candidate.y)>=35)){best=candidate;found=true;break;}}
 placed.push(best);
 }return placed;
}
