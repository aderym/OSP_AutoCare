import type {BodyType} from './vehicle-map.ts';
import type {Vec3} from './vehicle-spatial.ts';
import {meshBuilder,type Face} from './vehicle-geometry.ts';
import {engineAssembly,alternatorAssembly,brakeAssembly} from './vehicle-engine.ts';
export type {Face} from './vehicle-geometry.ts';
export type View3D={yaw:number,pitch:number,zoom:number};
export function project3D(p:Vec3,view:View3D,width:number,height:number){const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),cp=Math.cos(view.pitch),sp=Math.sin(view.pitch);const x=p[0]*cy-p[2]*sy,z=p[0]*sy+p[2]*cy,y=(p[1]-.65)*cp-z*sp,depth=(p[1]-.65)*sp+z*cp;const perspective=9/(9-depth),scale=Math.min(width/6.5,height/4)*view.zoom;return {x:width/2+x*scale*perspective,y:height*.57-y*scale*perspective,depth};}
export function explodedPoint(p:Vec3,tag:string,explode:boolean):Vec3{if(!explode)return p;const y=['hood','roof','windshield','rearBody'].includes(tag)?.78:['engine','alternator','battery','radiator','condenser','fan','reservoir','electrical','brakeHydraulics'].includes(tag)?.4:0;const z=['wheels','brakes','suspension'].includes(tag)?Math.sign(p[2])*.45:0;return [p[0],p[1]+y,p[2]+z];}
/** Original contemporary reference body, four distinct layouts. Not factory/model CAD. */
export function buildVehicleScene(type:BodyType,ev=false):Face[]{
 const m=meshBuilder(),{face,box,cylinder,lathe,tube}=m;const body='#397f78',dark='#162c36',metal='#9daeb8',w=type==='car'?1:1.05;
 const roofH=type==='car'?1.49:type==='suv'?1.78:type==='truck'?1.69:1.98,roofF=type==='van'?-.98:-.39,roofR=type==='truck'?.66:type==='car'?1.03:1.55,rearBase=type==='truck'?.95:type==='car'?1.79:2.02;
 // Sculpted hood and nose: shoulder surfaces curve down to an open bumper grille.
 const hood=[[-2.34,.78,.65],[-2.17,.91,.81],[-1.88,1,.88],[-1.42,1.04,.89],[-.93,1.06,.86]];
 const hoodRings=hood.map(([x,y,z])=>Array.from({length:9},(_,i)=>{const s=(i-4)/4;return [x,y-.115*Math.pow(Math.abs(s),2),s*z*w] as Vec3;}));
 for(let i=0;i<hoodRings.length-1;i++)for(let j=0;j<8;j++)face([hoodRings[i][j],hoodRings[i+1][j],hoodRings[i+1][j+1],hoodRings[i][j+1]],body,'hood','body');
 // Lower side skins with real wheel-opening outlines instead of solid slabs.
 for(const side of [-1,1]){
  const z=side*.91*w;const lower:Vec3[]=[[-2.34,.4,z],[-1.91,.4,z]];for(let i=0;i<=14;i++){const a=Math.PI-i*Math.PI/14;lower.push([-1.38+Math.cos(a)*.5,.43+Math.sin(a)*.5,z]);}lower.push([.88,.4,z]);for(let i=0;i<=14;i++){const a=Math.PI-i*Math.PI/14;lower.push([1.38+Math.cos(a)*.5,.43+Math.sin(a)*.5,z]);}lower.push([2.31,.4,z]);
  for(let i=0;i<lower.length-1;i++){const a=lower[i],b=lower[i+1];face([a,b,[b[0],1.02,z*.96],[a[0],1.02,z*.96]],body,'body','body');}
  tube(lower,.035,'#213842','body',6,'trim');tube([[-2.08,.96,z],[-.92,1.08,z*.97],[1.72,1.08,z*.98],[2.22,.91,z]],.013,'#6dada5','body',6,'trim');
  box([.04,.39,side*.9*w],[1.65,.13,.085],dark,'body','trim');
  // Split side glazing, raked pillars, recessed flush handles and door panel seams.
  const p0:Vec3=[-.91,1.05,side*.87*w],p1:Vec3=[roofF,roofH-.055,side*.7*w],p2:Vec3=[roofR,roofH-.055,side*.7*w],p3:Vec3=[rearBase,1.05,side*.87*w];
  face([p0,p1,p2,p3],'#345967','doors','glass');tube([p0,p1,p2,p3],.035,dark,'doors',7,'trim');tube([p0,p3],.026,metal,'doors',6,'trim');
  const pillar=(roofF+roofR)*.48;tube([[pillar,1.06,side*.87*w],[pillar-.04,roofH-.035,side*.71*w]],.047,dark,'doors',6,'trim');
  for(const x of type==='truck'?[.53]:[.04,1.05]){tube([[x+.1,.45,side*.918*w],[x+.12,.95,side*.918*w],[x+.05,1.08,side*.87*w]],.009,dark,'doors',5,'trim');box([x,1,side*.932*w],[.18,.025,.02],metal,'doors','trim');}
  tube([[-.69,1.12,side*.83*w],[-.71,1.12,side*1.04*w]],.026,dark,'doors',7);box([-.75,1.16,side*1.04*w],[.24,.105,.155],body,'doors','body');box([-.7,1.17,side*1.12*w],[.17,.065,.012],'#96b5be','doors','glass');
 }
 // Curved panoramic roof and raked front/rear glass.
 const roofSlices=[0,.12,.4,.7,.9,1].map(t=>{const x=roofF+(roofR-roofF)*t;return Array.from({length:9},(_,i)=>{const s=(i-4)/4;return [x,roofH+.045*Math.sin(t*Math.PI)-.085*s*s,s*.71*w] as Vec3;});});
 for(let n=0;n<roofSlices.length-1;n++)for(let i=0;i<8;i++){const pano=n>0&&n<4&&i>0&&i<7;face([roofSlices[n][i],roofSlices[n+1][i],roofSlices[n+1][i+1],roofSlices[n][i+1]],pano?'#203d48':body,'roof',pano?'glass':'body');}
 face([[-.94,1.04,-.86*w],[roofF,roofH-.02,-.71*w],[roofF,roofH-.02,.71*w],[-.94,1.04,.86*w]],'#4c7e8e','windshield','glass');
 for(const s of [-1,1])tube([[-.94,1.04,s*.86*w],[roofF,roofH-.02,s*.71*w],[roofR,roofH-.02,s*.71*w],[rearBase,1.06,s*.87*w]],.035,body,'roof',7,'body');
 face([[roofR,roofH-.03,-.71*w],[rearBase,1.06,-.87*w],[rearBase,1.06,.87*w],[roofR,roofH-.03,.71*w]],'#395d6c','rearBody','glass');
 for(const s of [-1,1])tube([[-.83,1.065,s*.48*w],[-.55,1.12,s*.1*w]],.013,dark,'windshield',6,'trim');
 if(type==='suv'||type==='van')for(const s of [-1,1])tube([[roofF+.1,roofH+.05,s*.64*w],[roofF+.25,roofH+.1,s*.64*w],[roofR-.15,roofH+.1,s*.64*w]],.022,metal,'roof',7,'trim');
 if(type==='truck'){box([1.59,.67,0],[1.42,.11,1.65*w],dark,'rearBody');for(const s of [-1,1])box([1.62,.93,s*.84*w],[1.4,.25,.1],body,'rearBody','body');box([2.3,.89,0],[.1,.3,1.66*w],body,'rearBody','body');for(let i=0;i<7;i++)box([1.6,.74,(i-3)*.2],[1.27,.022,.035],'#3f5660','rearBody');}
 else{box([2.12,.81,0],[.4,.39,1.57*w],body,'rearBody','body');box([roofR+.12,roofH-.01,0],[.22,.045,1.47*w],dark,'rearBody','trim');}
 // Distinctive contemporary LED signature, grille and diffuser.
 for(const x of [-2.32,2.32]){box([x,.47,0],[.16,.17,1.71*w],dark,x<0?'frontBumper':'rearBumper','trim');box([x,.39,0],[.2,.055,1.8*w],metal,x<0?'frontBumper':'rearBumper','trim');}
 box([-2.34,.66,0],[.045,.24,1.08*w],dark,'frontBumper','trim');for(let i=0;i<6;i++)box([-2.37,.56+i*.04,0],[.025,.012,1.04*w],'#657f86','frontBumper','trim');for(let i=0;i<11;i++)box([-2.38,.67,(i-5)*.09],[.012,.19,.008],'#304c58','frontBumper','trim');
 tube([[-2.36,.89,-.8*w],[-2.38,.92,-.42*w],[-2.38,.92,.42*w],[-2.36,.89,.8*w]],.017,'#e0f7f5','frontLamps',8,'trim');
 for(const s of [-1,1]){tube([[-2.31,.91,s*.8*w],[-2.28,.89,s*.87*w],[-2.27,.74,s*.87*w]],.022,'#d0ecf2','frontLamps',8,'trim');box([2.34,.94,s*.62*w],[.035,.065,.53*w],'#e45e56','rearLamps','trim');box([-2.33,.53,s*.69*w],[.025,.045,.18],'#d2e8e6','frontLamps','trim');}box([2.35,.94,0],[.03,.022,.96*w],'#d75d52','rearLamps','trim');
 box([0,.35,0],[3.95,.1,1.42*w],dark,'underbody');
 for(const x of [-1.38,1.38])for(const s of [-1,1]){const z=s*.99*w;
  lathe([x,.43,z],[[-.14,.285],[-.15,.35],[-.12,.414],[-.06,.435],[.06,.435],[.12,.414],[.15,.35],[.14,.285]],'#1f2b32','wheels','z',28,'tire');
  lathe([x,.43,z],[[-.12,.245],[-.12,.285],[.14,.285],[.14,.245]],'#bac6cd','wheels','z',24);cylinder([x,.43,z+s*.14],.065,.026,'#3c5865','wheels','z',14);
  for(let j=0;j<10;j++){const a=j*Math.PI/5;tube([[x+Math.cos(a)*.065,.43+Math.sin(a)*.065,z+s*.142],[x+Math.cos(a+.15)*.245,.43+Math.sin(a+.15)*.245,z+s*.136]],.018,'#a5b8c3','wheels',6);}
  brakeAssembly(m,[x,.43,z-s*.1]);tube([[x,.4,s*.62*w],[x,.97,s*.62*w]],.033,metal,'suspension',9);const spring:Vec3[]=[];for(let n=0;n<=48;n++){const a=n*Math.PI/6;spring.push([x+Math.cos(a)*.075,.55+n*.0065,s*.62*w+Math.sin(a)*.075]);}tube(spring,.012,'#d5a75d','suspension',5);tube([[x-.23,.34,s*.38],[x+.1,.37,s*.76],[x+.25,.34,s*.38]],.035,'#708b98','suspension',7);
 }
 tube([[-1.38,.4,-.75],[-1.38,.4,.75]],.043,metal,'steering',9);tube([[1.38,.4,-.8],[1.38,.4,.8]],.05,metal,'driveline',9);
 // Seats, dashboard display and steering wheel stay visible in cutaway mode.
 box([-.39,1.01,0],[.27,.15,1.47],dark,'dashboard');box([-.28,1.14,0],[.045,.23,.43],'#080f18','dashboard');box([-.25,1.15,0],[.012,.18,.36],'#5b9eac','dashboard');lathe([-.12,1.04,-.4],[[-.025,.115],[-.025,.14],[.025,.14],[.025,.115]],'#364f59','dashboard','x',20);
 for(const x of [.13,.98])for(const s of [-1,1]){box([x,.66,s*.41],[.48,.15,.48],'#7b8f96','interior');box([x+.21,.96,s*.41],[.13,.57,.48],'#526e7b','interior');box([x+.21,1.3,s*.41],[.13,.17,.28],'#7b8f96','interior');for(const z of [-.15,.15])tube([[x-.17,.74,s*.41+z],[x+.15,.74,s*.41+z],[x+.135,1.18,s*.41+z]],.009,'#b1c5c5','interior',5);}
 box([-.45,.86,.3],[.28,.3,.42],'#8397a2','hvac');
 if(ev){box([.08,.3,0],[2.56,.2,1.3],'#566e7c','hvBattery');for(let i=0;i<8;i++)box([-.98+i*.29,.414,0],[.265,.016,1.13],'#2d818b','hvBattery');cylinder([-1.22,.59,0],.21,.52,metal,'driveMotor','z',20);box([-1.2,.86,0],[.51,.19,.56],'#7295a1','driveMotor');for(let i=0;i<10;i++)box([-1.4+i*.045,.96,0],[.014,.02,.5],'#bec9ca','driveMotor');tube([[.4,.43,.51],[-.48,.43,.51],[-.74,.7,.43],[-1.16,.85,.3]],.025,'#dd8139','hvBattery',8);}
 else{engineAssembly(m,[-1.28,.54,0]);alternatorAssembly(m,[-1.75,.62,.47]);lathe([-.65,.52,0],[[-.3,.11],[-.21,.23],[.02,.24],[.3,.12]],'#a0afb8','transmission','x',16);for(let i=0;i<6;i++)cylinder([-.85+i*.07,.52,0],.245,.013,'#7c939e','transmission','x',12);cylinder([-.7,.43,.3],.09,.28,'#687e89','starter','x',14);cylinder([-.54,.51,.3],.045,.14,'#354d5a','starter','x',12);box([.99,.34,0],[.85,.23,.91],'#4b6270','fuelTank');lathe([-.44,.28,.35],[[-.3,.045],[-.2,.12],[.2,.12],[.3,.045]],'#a7a99c','catalyst','x',14);tube([[.3,.24,.35],[.8,.25,.35],[1.2,.29,.35]],.037,'#a6b3b6','exhaust',8);lathe([1.67,.29,.35],[[-.32,.04],[-.22,.14],[.23,.14],[.32,.04]],'#a8b9bc','muffler','x',16);tube([[1.95,.27,.35],[2.34,.27,.35]],.045,metal,'exhaust',10);tube([[-.32,.36,0],[1.4,.36,0]],.045,'#6f8998','driveline',9);cylinder([1.38,.43,0],.17,.32,'#7a919e','differential','z',14);}
 box([-2,.72,0],[.075,.53,1.17],'#75959d','radiator');for(let i=0;i<22;i++)box([-2.045,.72,-.54+i*.052],[.012,.48,.008],'#bbcbcf','radiator');box([-2.1,.72,0],[.04,.48,1.1],'#617e8b','condenser');
 for(const z of [-.29,.29]){lathe([-1.91,.73,z],[[-.035,.17],[-.035,.215],[.035,.215],[.035,.17]],dark,'fan','x',20);cylinder([-1.91,.73,z],.05,.08,'#66818c','fan','x',12);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;face([[-1.9,.73+Math.cos(a)*.05,z+Math.sin(a)*.05],[-1.9,.73+Math.cos(a+.35)*.19,z+Math.sin(a+.35)*.19],[-1.88,.73+Math.cos(a+.85)*.17,z+Math.sin(a+.85)*.17],[-1.88,.73+Math.cos(a+.45)*.05,z+Math.sin(a+.45)*.05]],'#4f6977','fan');}}
 tube([[-1.98,.93,.44],[-1.8,1.02,.48],[-1.55,.96,.4]],.035,'#182b35','radiator',8);box([-.94,.94,-.61],[.36,.24,.3],'#253b48','battery');box([-.94,1.065,-.61],[.38,.025,.32],'#566c78','battery');for(const z of [-.7,-.53]){cylinder([-.94,1.09,z],.022,.035,z<-.6?'#e17d57':'#b9c7c9','battery','y',8);tube([[-.94,1.09,z],[-.72,1.08,z],[-.65,.9,z]],.013,z<-.6?'#b65340':'#192c37','battery',6);}
 lathe([-1.13,.96,.67],[[-.12,.1],[-.08,.14],[.1,.12],[.13,.07]],'#d3c9a4','reservoir','y',12);cylinder([-1.13,1.11,.67],.055,.035,'#303b45','reservoir','y',10);cylinder([-.58,.92,-.3],.13,.1,'#273d48','brakeHydraulics','x',14);box([-.61,1.04,-.3],[.17,.1,.16],'#c8c9af','brakeHydraulics');box([-.66,.94,-.64],[.23,.15,.25],'#273d49','electrical');box([-1.56,.5,.49],[.24,.18,.23],'#8399a3','accessories');
 // Keep engine-bay accessories below the closed hood. The exploded view raises them explicitly.
 const lower=new Set(['battery','reservoir','electrical','brakeHydraulics','radiator','condenser','fan']);
 return m.faces.map(f=>lower.has(f.tag)?{...f,points:f.points.map(p=>[p[0],p[1]-.17,p[2]] as Vec3)}:f);
}
/** Ray-to-polygon picking in the same projected surface space used for rendering. */
export function pointInPolygon(x:number,y:number,points:{x:number,y:number}[]){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
