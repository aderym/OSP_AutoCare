import type {Face} from './vehicle-geometry.ts';
import type {Vec3} from './vehicle-spatial.ts';
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
/** Offline orthographic studio render with depth ordering, material colors and directional surface light. */
export function renderComponentSVG(faces:Face[],title:string,family=''):string {
 const flat=['gasket','headgasket','ring','head','pan','hood','door','fender','panel','bracket','arm','subframe','sheet','film','pack','scale','process','pad','shoe','seat','cup','strainer'];
 const yaw=.68,pitch=flat.includes(family)?.88:.42,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const camera=(p:Vec3):Vec3=>{const x=p[0]*cy-p[2]*sy,z=p[0]*sy+p[2]*cy;return [x,-p[1]*cp+z*sp,p[1]*sp+z*cp];};
 const polygons=faces.filter(f=>f.points.length>=3).map(f=>({face:f,points:f.points.map(camera)}));
 const vertices=polygons.flatMap(f=>f.points);
 if(!vertices.length)throw Error('Cannot render empty component '+title);
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const p of vertices){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}
 const width=960,height=700,scale=Math.min(860/Math.max(.01,maxX-minX),600/Math.max(.01,maxY-minY)),cx=(minX+maxX)/2,cyy=(minY+maxY)/2;
 polygons.sort((a,b)=>a.points.reduce((v,p)=>v+p[2],0)/a.points.length-b.points.reduce((v,p)=>v+p[2],0)/b.points.length);
 const color=(face:Face)=>{
  const p=face.points,a=p[1].map((v,i)=>v-p[0][i]),b=p[2].map((v,i)=>v-p[0][i]);
  const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=Math.hypot(...n)||1;
  const dot=Math.abs((n[0]*-.35+n[1]*.85+n[2]*.38)/len),specular=Math.pow(dot,18)*.17;
  const material=face.color.match(/[0-9a-f]{2}/gi)?.map(x=>parseInt(x,16))||[160,170,180];
  const metallic=Math.max(...material)>95,light=.64+dot*.48;
  return '#'+material.map(v=>Math.round(Math.min(255,v*light+(metallic?255*specular:110*specular))).toString(16).padStart(2,'0')).join('');
 };
 const paths=polygons.map(({face,points})=>{
  const d=points.map((p,i)=>(i?'L':'M')+(width/2+(p[0]-cx)*scale).toFixed(2)+' '+(height/2+(p[1]-cyy)*scale).toFixed(2)).join(' ')+'Z';
  return '<path d="'+d+'" fill="'+color(face)+'" stroke="'+color(face)+'" stroke-opacity=".8" stroke-width=".35" stroke-linejoin="round"/>';
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="700" viewBox="0 0 960 700" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">Original shaded perspective illustration of the component type. Generic, not OEM, not to scale. Ilustración original en perspectiva del tipo de componente, no OEM, sin escala.</desc>${paths}</svg>\n`;
}
