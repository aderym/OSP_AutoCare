import type {Vec3} from './vehicle-spatial.ts';
export type Face={points:Vec3[],color:string,tag:string,kind:'body'|'glass'|'part'|'tire'|'trim'};
export function meshBuilder(){
 const faces:Face[]=[];
 const face=(points:Vec3[],color:string,tag:string,kind:Face['kind']='part')=>{faces.push({points,color,tag,kind});};
 function box(center:Vec3,size:Vec3,color:string,tag:string,kind:Face['kind']='part'){
  const [x,y,z]=center,[a,b,c]=size.map(n=>n/2);const p:Vec3[]=[[-a,-b,-c],[a,-b,-c],[a,b,-c],[-a,b,-c],[-a,-b,c],[a,-b,c],[a,b,c],[-a,b,c]].map(v=>[v[0]+x,v[1]+y,v[2]+z] as Vec3);
  for(const ids of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]])face(ids.map(i=>p[i]),color,tag,kind);
 }
 function roundedBox(center:Vec3,size:Vec3,r:number,color:string,tag:string,kind:Face['kind']='part'){
  const [a,b,c]=size.map(n=>n/2),radius=Math.min(r,a*.8,b*.8,c*.8),rings:Vec3[][]=[];
  for(const [y,inset]of [[-b,radius],[-b+radius,0],[b-radius,0],[b,radius]]){const ring:Vec3[]=[];const ax=a-inset,cz=c-inset,corner=Math.max(.002,radius-inset*.5);for(const [sx,sz,offset]of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]])for(let i=0;i<=3;i++){const angle=offset+i*Math.PI/6;ring.push([center[0]+sx*(ax-corner)+Math.cos(angle)*corner,center[1]+y,center[2]+sz*(cz-corner)+Math.sin(angle)*corner]);}rings.push(ring);}
  face([...rings[0]].reverse(),color,tag,kind);face(rings[3],color,tag,kind);for(let j=0;j<3;j++)for(let i=0;i<rings[j].length;i++)face([rings[j][i],rings[j][(i+1)%rings[j].length],rings[j+1][(i+1)%rings[j].length],rings[j+1][i]],color,tag,kind);
 }
 function lathe(center:Vec3,profile:[number,number][],color:string,tag:string,axis:'x'|'y'|'z'='y',segments=18,kind:Face['kind']='part'){
  const rings=profile.map(([h,r])=>Array.from({length:segments},(_,i)=>{const a=i*Math.PI*2/segments,u=Math.cos(a)*r,v=Math.sin(a)*r;return [center[0]+(axis==='x'?h:u),center[1]+(axis==='y'?h:axis==='x'?u:v),center[2]+(axis==='z'?h:v)] as Vec3;}));
  for(let n=0;n<rings.length-1;n++)for(let i=0;i<segments;i++)face([rings[n][i],rings[n][(i+1)%segments],rings[n+1][(i+1)%segments],rings[n+1][i]],color,tag,kind);
 }
 function cylinder(c:Vec3,r:number,width:number,color:string,tag:string,axis:'x'|'y'|'z'='z',segments=16,kind:Face['kind']='part'){lathe(c,[[-width/2,0],[-width/2,r],[width/2,r],[width/2,0]],color,tag,axis,segments,kind);}
 function tube(path:Vec3[],r:number,color:string,tag:string,segments=7,kind:Face['kind']='part'){
  const rings=path.map((p,i)=>{const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)],d=b.map((n,j)=>n-a[j]),l=Math.hypot(...d)||1;const t=d.map(n=>n/l);const ref=Math.abs(t[1])>.9?[1,0,0]:[0,1,0];const u=[t[1]*ref[2]-t[2]*ref[1],t[2]*ref[0]-t[0]*ref[2],t[0]*ref[1]-t[1]*ref[0]],ul=Math.hypot(...u)||1;for(let j=0;j<3;j++)u[j]/=ul;const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];return Array.from({length:segments},(_,k)=>p.map((n,j)=>n+r*(Math.cos(k*2*Math.PI/segments)*u[j]+Math.sin(k*2*Math.PI/segments)*v[j])) as Vec3);});
  for(let n=0;n<rings.length-1;n++)for(let i=0;i<segments;i++)face([rings[n][i],rings[n][(i+1)%segments],rings[n+1][(i+1)%segments],rings[n+1][i]],color,tag,kind);
 }
 return {faces,face,box,roundedBox,lathe,cylinder,tube};
}
export type MeshBuilder=ReturnType<typeof meshBuilder>;
/** Centre and fit an isolated assembly without changing its proportions. */
export function fitAssembly(faces:Face[]):Face[]{if(!faces.length)return [];const pts=faces.flatMap(f=>f.points),min=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i]))),scale=2.8/Math.max(...max.map((v,i)=>v-min[i]),.01);return faces.map(f=>({...f,points:f.points.map(p=>[(p[0]-(min[0]+max[0])/2)*scale,(p[1]-(min[1]+max[1])/2)*scale+.75,(p[2]-(min[2]+max[2])/2)*scale] as Vec3)}));}
