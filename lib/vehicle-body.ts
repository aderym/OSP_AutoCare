import type {BodyType} from './vehicle-map.ts';
import type {MeshBuilder} from './vehicle-geometry.ts';
import type {Vec3} from './vehicle-spatial.ts';
export const bodyDimensions={car:{roof:1.45,front:-.43,rear:.68,rearBase:1.85},suv:{roof:1.65,front:-.48,rear:.82,rearBase:1.94},truck:{roof:1.7,front:-.48,rear:.42,rearBase:.86},van:{roof:1.9,front:-.82,rear:1.15,rearBase:2.06}};
const smooth=(t:number)=>t*t*(3-2*t);
function sample(points:number[][],x:number,index:number){if(x<=points[0][0])return points[0][index];for(let i=1;i<points.length;i++)if(x<=points[i][0]){const a=points[i-1],b=points[i],t=smooth((x-a[0])/(b[0]-a[0]));return a[index]+(b[index]-a[index])*t;}return points[points.length-1][index];}
/** Original aerodynamic concept bodies. Continuous curved skins, not a production OEM model. */
export function modernVehicleBody(m:MeshBuilder,type:BodyType){
 const {face,box,roundedBox,tube,lathe,cylinder}=m,d=bodyDimensions[type],w=type==='car'?1:1.035,paint='#286c62',dark='#101d26',trim='#25373d',chrome='#9caeb3';
 const profile=[[-2.38,.73,.66],[-2.24,.91,.82],[-1.86,1.03,.94],[-1.35,1.09,.955],[-.88,1.13,.94],[0,1.12,.94],[1.13,1.12,.955],[1.8,1.07,.94],[2.2,.96,.86],[2.38,.79,.67]];
 const belt=(x:number)=>sample(profile,x,1),width=(x:number)=>sample(profile,x,2)*w;
 const arch=(x:number)=>{const delta=Math.min(Math.abs(x+1.38),Math.abs(x-1.38));return delta<.495?.43+Math.sqrt(.495**2-delta**2):.36;};
 // Crown of the hood; the nose and shoulder widths taper continuously.
 const hx=Array.from({length:25},(_,i)=>-2.38+i*1.38/24),hoodRings=hx.map(x=>Array.from({length:19},(_,i)=>{const s=(i-9)/9;return [x,belt(x)+.055*(1-s*s),s*width(x)] as Vec3;}));
 for(let i=0;i<hx.length-1;i++)for(let j=0;j<18;j++)face([hoodRings[i][j],hoodRings[i+1][j],hoodRings[i+1][j+1],hoodRings[i][j+1]],paint,'hood','body');
 // Sides are curved in both axes with shaped wheel openings and muscular shoulders.
 const xs=Array.from({length:83},(_,i)=>-2.38+i*4.76/82);
 for(const side of [-1,1]){
  const rings=xs.map(x=>Array.from({length:10},(_,i)=>{const t=i/9,bottom=arch(x),y=belt(x)*(1-t)+bottom*t,z=width(x)*(.965+.055*Math.sin(t*Math.PI)-.045*t*t);return [x,y,side*z] as Vec3;}));
  for(let n=0;n<xs.length-1;n++)for(let j=0;j<9;j++)face([rings[n][j],rings[n+1][j],rings[n+1][j+1],rings[n][j+1]],paint,'body','body');
  // Wheel-arch lips follow the curved skin, with no exposed bolt or rivet pattern.
  for(const x of [-1.38,1.38]){const path=Array.from({length:33},(_,i)=>{const a=Math.PI-i*Math.PI/32;const px=x+Math.cos(a)*.497;return [px,.43+Math.sin(a)*.497,side*width(px)*.99] as Vec3;});tube(path,.018,'#203535','body',7,'trim');}
  for(const axle of [-1.38,1.38])cylinder([axle,.43,side*.84*w],.468,.025,'#101e24','body','z',36,'body');
  tube([[-.85,.38,side*.91*w],[.25,.34,side*.92*w],[.86,.39,side*.94*w]],.045,trim,'body',7,'trim');
 }
 // Canopy: steeply raked windshield, low arcing crown and descending rear glass.
 const frontBase=type==='van'?-1.37:-1.0;
 const roofStations=[[frontBase,belt(frontBase)+.05,.85],[d.front,d.roof-.055,.755],[(d.front+d.rear)*.5,d.roof,.75],[d.rear,d.roof-.07,.735],[d.rearBase,belt(d.rearBase)+.035,.855]];
 const canopyX=Array.from({length:49},(_,i)=>frontBase+(d.rearBase-frontBase)*i/48);
 const cross=(x:number,u:number):Vec3=>{const y=sample(roofStations,x,1),z=sample(roofStations,x,2)*w;return [x,y-.07*Math.pow(Math.abs(u),3),u*z];};
 const windshieldEnd=d.front,roofEnd=d.rear;
 for(let n=0;n<canopyX.length-1;n++)for(let j=0;j<20;j++){
  const x=canopyX[n],next=canopyX[n+1],u=(j-10)/10,v=(j-9)/10,center=(x+next)/2;const tag=center<windshieldEnd?'windshield':center>roofEnd?'rearBody':'roof';const panoramic=tag==='roof'&&j>1&&j<18;
  face([cross(x,u),cross(next,u),cross(next,v),cross(x,v)],tag==='roof'&&!panoramic?paint:tag==='windshield'?'#1e333f':'#152b34',tag,tag==='roof'&&!panoramic?'body':'glass');
 }
 // Curved side windows taper at A and C pillars instead of a rectangular cabin box.
 for(const side of [-1,1]){
  const top=(x:number)=>{const p=cross(x,side);return [p[0],p[1],p[2]] as Vec3;},bottom=(x:number):Vec3=>[x,belt(x)+.025,side*width(x)*.962];
  for(let n=0;n<canopyX.length-1;n++){const x=canopyX[n],next=canopyX[n+1];for(let j=0;j<5;j++){const a=j/5,b=(j+1)/5;const point=(px:number,t:number):Vec3=>{const lo=bottom(px),hi=top(px);return [px,lo[1]+(hi[1]-lo[1])*t,lo[2]+(hi[2]-lo[2])*t+.008*Math.sin(t*Math.PI)*side];};face([point(x,a),point(next,a),point(next,b),point(x,b)],'#142c37','doors','glass');}}
  tube(canopyX.map(x=>top(x)),.018,paint,'roof',8,'body');tube(canopyX.map(x=>bottom(x)),.009,'#718f94','doors',6,'trim');
  const mid=type==='truck'?.12:.14;for(const x of [d.front+.025,mid,d.rear-.02])tube([bottom(x),top(x)],x===mid?.035:.022,dark,'doors',7,'trim');
  // Pillars and shoulder panels form a swept, dark rear quarter.
  const rearStart=d.rear-.03;face([top(rearStart),top(d.rearBase),bottom(d.rearBase),bottom(rearStart)],paint,'body','body');
  for(const x of type==='truck'?[.28]:[-.09,1.0]){const z=side*width(x)*1.007;roundedBox([x,1.055,z],[.18,.025,.025],.009,'#294a47','doors','trim');}
  tube([[-.73,1.16,side*.84*w],[-.76,1.19,side*.98*w]],.022,dark,'doors',7);roundedBox([-.8,1.22,side*1.01*w],[.22,.1,.14],.035,paint,'doors','body');roundedBox([-.78,1.225,side*1.08*w],[.16,.064,.012],.005,'#60818b','doors','glass');
 }
 // Rounded front and rear fascia surfaces; all lighting is embedded in the body.
 for(const front of [true,false]){
  const sign=front?-1:1,tag=front?'frontBumper':'rearBumper';
  const point=(u:number,v:number):Vec3=>{const z=u*.89*w,x=sign*(2.38-.18*Math.pow(Math.abs(u),2)-.055*Math.sin(v*Math.PI)),y=.34+v*(.49+.07*(1-u*u));return [x,y,z];};
  for(let i=0;i<24;i++)for(let j=0;j<9;j++){const u=-1+i/12,v=-1+(i+1)/12,a=j/9,b=(j+1)/9;face([point(u,a),point(v,a),point(v,b),point(u,b)],paint,tag,'body');}
 }
 // Narrow continuous running lights and swept corner segments.
 const lightPath=(front:boolean,y:number)=>Array.from({length:41},(_,i)=>{const u=(i-20)/20;return [(front?-1:1)*(2.392-.18*u*u),y-.035*u*u,u*.85*w] as Vec3;});
 tube(lightPath(true,.865),.012,'#d6f3f0','frontLamps',8,'trim');tube(lightPath(false,.9),.012,'#e75a59','rearLamps',8,'trim');
 for(const s of [-1,1]){
  tube([[-2.27,.84,s*.75*w],[-2.18,.87,s*.88*w],[-1.99,.92,s*.93*w]],.02,'#b7e1e6','frontLamps',9,'trim');
  tube([[2.24,.87,s*.75*w],[2.13,.88,s*.9*w],[1.98,.91,s*.94*w]],.018,'#d95755','rearLamps',8,'trim');
  roundedBox([-2.29,.59,s*.66*w],[.05,.1,.18],.024,dark,'frontBumper','trim');tube([[-2.33,.58,s*.71*w],[-2.33,.58,s*.62*w]],.009,'#b8dbdf','frontLamps',6,'trim');
 }
 // An integrated lower air intake and body-color grille surround, not a chrome frame.
 const grille=[[-2.39,.48,-.54*w],[-2.39,.68,-.62*w],[-2.39,.7,.62*w],[-2.39,.48,.54*w]] as Vec3[];face(grille,dark,'frontBumper','trim');for(let i=0;i<5;i++)tube([[-2.396,.5+i*.038,-.52*w],[-2.396,.5+i*.038,.52*w]],.006,'#344c50','frontBumper',5,'trim');
 if(type==='truck'){
  roundedBox([1.57,.69,0],[1.38,.14,1.58*w],.045,dark,'rearBody');for(const s of [-1,1])roundedBox([1.6,.99,s*.83*w],[1.4,.16,.1],.035,paint,'rearBody','body');roundedBox([2.25,.9,0],[.14,.34,1.62*w],.055,paint,'rearBody','body');
 }else{
  // A curved hatch/fastback deck fills the rear volume, with an integrated lip spoiler.
  const path=Array.from({length:17},(_,i)=>{const u=(i-8)/8;return [d.rear+.09,d.roof-.075-.05*u*u,u*.73*w] as Vec3;});tube(path,.025,dark,'rearBody',8,'trim');
  const deck=Array.from({length:13},(_,i)=>{const x=d.rearBase+(2.38-d.rearBase)*i/12;return Array.from({length:19},(_,j)=>{const u=(j-9)/9;return [x,belt(x)+.035*(1-u*u),u*width(x)] as Vec3;});});for(let i=0;i<deck.length-1;i++)for(let j=0;j<18;j++)face([deck[i][j],deck[i+1][j],deck[i+1][j+1],deck[i][j+1]],paint,'rearBody','body');
 }
 // Thin wipers follow the swept windshield, hidden at the cowl when seen from the side.
 for(const s of [-1,1])tube([[frontBase+.06,belt(frontBase)+.075,s*.59*w],[frontBase+.23,belt(frontBase)+.18,s*.12*w]],.009,dark,'windshield',6,'trim');
 return {paint,dark,metal:chrome,w};
}
