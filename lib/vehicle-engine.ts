import type {MeshBuilder} from './vehicle-geometry.ts';
import type {Vec3} from './vehicle-spatial.ts';
/** Original illustrative inline-four turbo assembly, not an OEM engine CAD file. */
export function engineAssembly(m:MeshBuilder,origin:Vec3=[-1.28,.66,0]){
 const {box,roundedBox,cylinder,tube,lathe}=m,p=(x:number,y:number,z:number):Vec3=>[origin[0]+x,origin[1]+y,origin[2]+z],tag='engine';
 roundedBox(p(0,-.04,0),[.75,.4,.51],.035,'#87969c',tag);roundedBox(p(0,-.31,0),[.66,.15,.45],.03,'#6c8c9b','oilPan');
 for(let i=0;i<7;i++)box(p(-.3+i*.1,-.385,0),[.026,.025,.43],'#b1c2c9','oilPan');
 cylinder(p(.2,-.405,.12),.022,.025,'#d3d3bc','oilPan','y',6);
 roundedBox(p(0,.21,0),[.83,.12,.57],.035,'#c2ccd0',tag);roundedBox(p(0,.31,0),[.78,.12,.5],.04,'#263e49',tag);roundedBox(p(0,.385,0),[.69,.028,.33],.01,'#405b65',tag);
 for(let i=0;i<4;i++){const x=-.29+i*.19;roundedBox(p(x,.42,0),[.105,.075,.12],.02,'#192a33',tag);box(p(x,.46,.025),[.06,.025,.07],'#d7a563',tag);cylinder(p(x,.29,-.27),.025,.05,'#bdc6c4',tag,'z',8);tube([p(x,.18,-.26),p(x,.32,-.35),p(x+.025,.35,-.48),p(x+.025,.1,-.51)],.046,'#a9b8bd',tag,8);tube([p(x,.16,.26),p(x,.05,.39),p(-.05,-.08,.46)],.029,'#ad8f73',tag,7);}
 for(let j=0;j<3;j++){tube([p(-.34+j*.026,.46,-.1),p(.28,.46,-.1),p(.39,.34,-.2)],.007,j===0?'#b19e63':'#152c35',tag,5);}
 for(const side of [-1,1])for(let j=0;j<8;j++)box(p(-.33+j*.09,-.08,side*.263),[.025,.2,.022],'#b0bdc2',tag);
 for(const x of [-.33,.33])for(const z of [-.2,.2])cylinder(p(x,.398,z),.013,.015,'#b7c5ca',tag,'y',6);
 tube([p(.33,.26,-.23),p(.43,.33,-.28),p(.48,.24,-.39),p(.4,-.1,-.38)],.013,'#243e49',tag,6);

 cylinder(p(.25,.405,.15),.064,.045,'#151f29',tag,'y',12);box(p(.25,.43,.15),[.065,.012,.018],'#d7af52',tag);
 box(p(.03,.1,-.48),[.7,.17,.19],'#2e4753',tag);for(let i=0;i<8;i++)box(p(-.29+i*.085,.195,-.49),[.027,.02,.15],'#7d939d',tag);
 tube([p(-.36,.09,-.48),p(-.52,.09,-.4),p(-.51,-.02,-.12)],.07,'#202e37',tag,10);
 lathe(p(-.09,-.08,.46),[[-.1,.05],[-.08,.11],[.02,.14],[.1,.105],[.13,.045]],'#a2adb0',tag,'x',14);
 tube([p(.02,-.07,.45),p(.2,.03,.5),p(.41,.08,.45),p(.42,.18,.2)],.045,'#b1babc',tag,8);
 for(const [y,z,r]of [[-.19,0,.105],[.15,.14,.08],[.12,-.15,.065]]){cylinder(p(-.43,y,z),r,.05,'#152b34',tag,'x',14);cylinder(p(-.465,y,z),r*.48,.018,'#a6b2b6',tag,'x',10);}
 tube([p(-.47,-.19,-.105),p(-.47,.13,-.215),p(-.47,.23,.14),p(-.47,-.19,.105),p(-.47,-.19,-.105)],.014,'#101c22',tag,5);
 for(const side of [-1,1])for(let i=0;i<4;i++)cylinder(p(-.29+i*.19,.28,side*.275),.017,.02,'#bec8ca',tag,'z',6);
 tube([p(.38,.18,.13),p(.49,.21,.2),p(.53,.3,.23)],.028,'#172f38',tag,7);
}
export function alternatorAssembly(m:MeshBuilder,c:Vec3=[0,0,0],tag='alternator'){
 const {cylinder,box}=m;const p=(x:number,y:number,z:number):Vec3=>[c[0]+x,c[1]+y,c[2]+z];
 cylinder(c,.155,.24,'#abb8bd',tag,'x',18);cylinder(p(-.14,0,0),.115,.05,'#253741',tag,'x',18);cylinder(p(-.175,0,0),.048,.025,'#bcc8cb',tag,'x',10);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box(p(0,Math.cos(a)*.143,Math.sin(a)*.143),[.15,.023,.026],'#263d47',tag);}
 for(const y of [-.16,.16]){box(p(.04,y,0),[.13,.065,.08],'#9baeb4',tag);cylinder(p(.04,y,0),.023,.09,'#263a44',tag,'z',8);}
}
export function brakeAssembly(m:MeshBuilder,c:Vec3=[0,0,0],tag='brakes',detailed=true){
 const {cylinder,lathe,box}=m;lathe(c,[[-.03,.07],[-.03,.255],[.03,.255],[.03,.07],[-.03,.07]],'#b7c1c5',tag,'z',detailed?28:20);cylinder([c[0],c[1],c[2]-.04],.11,.11,'#6b7f8b',tag,'z',16);
 for(let i=0;i<(detailed?16:8);i++){const a=i*Math.PI*2/(detailed?16:8);for(const r of [.18,.22])cylinder([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]+.032],.007,.002,'#334954',tag,'z',6);}
 box([c[0]+.21,c[1]+.035,c[2]+.01],[.13,.29,.13],'#c95e45',tag);box([c[0]+.215,c[1]+.04,c[2]+.082],[.075,.18,.015],'#df9b6a',tag);for(const y of [-.085,.14])cylinder([c[0]+.215,c[1]+y,c[2]+.092],.012,.012,'#d7d9cf',tag,'z',6);
}
