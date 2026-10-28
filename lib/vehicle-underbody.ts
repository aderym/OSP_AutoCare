import type {MeshBuilder} from './vehicle-geometry.ts';
import type {Vec3} from './vehicle-spatial.ts';
export type DriveLayout='fwd'|'rwd'|'awd';
export function inferDriveLayout(vehicle:any):{layout:DriveLayout,estimated:boolean}{const value=String(vehicle?.drive||'').toLowerCase();if(/front|\bfwd\b/.test(value))return {layout:'fwd',estimated:false};if(/rear|\brwd\b/.test(value))return {layout:'rwd',estimated:false};if(/all|4.wheel|4wd|4x4|awd/.test(value))return {layout:'awd',estimated:false};return {layout:'awd',estimated:true};}
export const lowerComponentTags=['oilPan','transmission','transferCase','driveline','uJoint','cvAxle','differential','steering','suspension','brakes','wheels','catalyst','exhaust','muffler','fuelTank','brakeLines','fuelLines','parkingBrake','underbody','floorPan','driveMotor','hvBattery'];
export function showUnderbodyFace(tag:string,kind:string){return lowerComponentTags.includes(tag)&&kind!=='glass';}
export function universalJoint(m:MeshBuilder,c:Vec3=[0,0,0]){const {cylinder,box}=m;const p=(x:number,y:number,z:number):Vec3=>[c[0]+x,c[1]+y,c[2]+z];cylinder(c,.033,.22,'#bcc9cf','uJoint','y',14);cylinder(c,.033,.22,'#bcc9cf','uJoint','z',14);for(const side of [-1,1]){cylinder(p(0,side*.105,0),.056,.055,'#748f9e','uJoint','y',16);cylinder(p(0,0,side*.105),.056,.055,'#748f9e','uJoint','z',16);box(p(-.07,side*.09,0),[.13,.055,.065],'#a7bac2','uJoint');box(p(.07,0,side*.09),[.13,.065,.055],'#a7bac2','uJoint');}cylinder(p(-.15,0,0),.085,.045,'#7d99a5','uJoint','x',16);cylinder(p(.15,0,0),.085,.045,'#7d99a5','uJoint','x',16);}
export function cvHalfShaft(m:MeshBuilder,x:number,side:number,cY=.43,detailed=true){const {cylinder,lathe}=m,tag='cvAxle',s=side;const at=(z:number):Vec3=>[x,cY,s*z];cylinder(at(.46),.027,.47,'#a2b8c4',tag,'z',detailed?14:10);for(const z of [.2,.73]){const profile:[number,number][]=[];for(let i=0;i<(detailed?13:9);i++)profile.push([(i-(detailed?6:4))*(detailed?.012:.018),(i%2?.08:.055)*(z<.3?1.13:1)]);lathe(at(z),profile,'#243a45',tag,'z',detailed?18:10);for(const off of [-.078,.078])cylinder(at(z+off),.06,.018,'#bdc9c9',tag,'z',detailed?16:10);}cylinder(at(.11),.095,.14,'#7897a7',tag,'z',detailed?18:10);cylinder(at(.88),.043,.16,'#c5d0d1',tag,'z',14);}
export function driveShaft(m:MeshBuilder){const {cylinder}=m;cylinder([.34,.35,0],.058,1.24,'#8aa8b7','driveline','x',22);for(const x of [-.15,.82])cylinder([x,.35,0],.064,.045,'#c2cfd0','driveline','x',20);universalJoint(m,[-.38,.35,0]);universalJoint(m,[1.06,.35,0]);}
export function differentialAssembly(m:MeshBuilder,c:Vec3=[1.38,.43,0]){const {lathe,cylinder,box}=m;lathe(c,[[-.22,.055],[-.16,.13],[0,.19],[.16,.13],[.22,.055]],'#6c8c9f','differential','z',24);cylinder([c[0]-.17,c[1],c[2]],.075,.2,'#7e9caa','differential','x',16);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;cylinder([c[0]+.155,c[1]+Math.cos(a)*.13,c[2]+Math.sin(a)*.13],.014,.025,'#c6cecc','differential','x',6);}for(let i=0;i<5;i++)box([c[0]-.1+i*.05,c[1]-.17,c[2]],[.015,.045,.24],'#afc0c3','differential');}
/** Generic service-lift reference: floor above components, no low opaque plate covering the driveline. */
export function underbodyAssembly(m:MeshBuilder,layout:DriveLayout='awd',ev=false,w=1){const {box,roundedBox,cylinder,lathe,tube}=m;
 // Raised stamped floor and side rails form the background of the lift view.
 roundedBox([.5,.55,0],[3.3,.055,1.48*w],.02,'#344f60','floorPan');for(const s of [-1,1]){box([.1,.43,s*.71*w],[3.7,.13,.09],'#648493','underbody');for(const x of [-1.27,1.31])tube([[x-.2,.47,s*.7],[x,.38,s*.4],[x+.2,.43,s*.7]],.047,'#8da6b0','underbody',9);}
 for(const x of [-.42,.55,1.85])box([x,.47,0],[.09,.07,1.34*w],'#688996','underbody');
 for(const s of [-1,1])tube([[-1.5,.41,s*.72],[-.4,.4,s*.67],[.7,.4,s*.68],[1.4,.42,s*.72]],.012,'#b78662','brakeLines',7);
 if(!ev)tube([[-1.3,.405,-.6],[-.4,.4,-.61],[.4,.4,-.59],[.88,.41,-.47]],.014,'#77aab2','fuelLines',7);tube([[.3,.42,.15],[.7,.41,.2],[1.35,.38,.45]],.012,'#394d58','parkingBrake',7);
 if(!ev){
  if(layout==='fwd'){lathe([-1.03,.45,-.3],[[-.2,.14],[-.12,.22],[.12,.24],[.27,.12]],'#9bb0bd','transmission','z',22);}
  else{lathe([-.7,.46,0],[[-.36,.11],[-.24,.23],[.06,.24],[.3,.12]],'#99afbc','transmission','x',22);for(let i=0;i<7;i++)cylinder([-.94+i*.065,.46,0],.238,.012,'#b4c5c9','transmission','x',16);driveShaft(m);differentialAssembly(m);}
  if(layout==='awd'){roundedBox([-.27,.39,-.14],[.3,.25,.35],.04,'#7b9caf','transferCase');tube([[-.3,.36,-.23],[-.85,.36,-.23],[-1.25,.4,-.16]],.039,'#819fae','transferCase',10);}
  // Fuel tank, straps and exhaust routing deliberately offset from the propeller shaft.
  roundedBox([.96,.36,-.39],[.8,.23,.56],.06,'#6c7980','fuelTank');for(const x of [.69,1.2])box([x,.235,-.39],[.055,.018,.57],'#c4c6af','fuelTank');tube([[.88,.45,-.57],[1.3,.47,-.67],[1.7,.7,-.85]],.025,'#4f646f','fuelTank',8);
  tube([[-1.35,.24,.3],[-.92,.21,.37],[-.72,.22,.38]],.035,'#abb6ac','exhaust',10);lathe([-.43,.22,.38],[[-.29,.04],[-.2,.105],[.19,.105],[.28,.04]],'#b9aa89','catalyst','x',20);tube([[-.14,.22,.38],[.35,.22,.42],[.73,.23,.52],[1.37,.23,.52]],.035,'#c0c5b9','exhaust',10);lathe([1.69,.27,.52],[[-.3,.04],[-.22,.145],[.21,.145],[.3,.04]],'#b6c5be','muffler','x',22);tube([[1.99,.26,.52],[2.3,.27,.61]],.045,'#b3c7cc','exhaust',12);
 }
 // Wheel drive shafts are shown only on driven reference axles.
 const axles=layout==='fwd'?[-1.38]:layout==='rwd'?[1.38]:[-1.38,1.38];for(const x of axles)for(const s of [-1,1])cvHalfShaft(m,x,s,.43,false);
 if(ev&&layout!=='fwd'){cylinder([1.38,.44,0],.17,.48,'#89a7b8','driveMotor','z',22);roundedBox([1.38,.65,0],[.43,.13,.42],.03,'#527e91','driveMotor');}
}
