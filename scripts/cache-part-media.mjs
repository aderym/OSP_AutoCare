/** Download the already reviewed reference pages as attributed local PNG assets.
 * Run with: node --experimental-strip-types scripts/cache-part-media.mjs
 */
import {searchPartMediaPage,mergePartPhotos} from '../lib/parts-finder.ts';
import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const run=promisify(execFile),root=path.resolve('public/part-media');await mkdir(root,{recursive:true});
const first=await searchPartMediaPage('alternator'),second=await searchPartMediaPage('alternator',fetch,'photo',24),diagrams=await searchPartMediaPage('alternator',fetch,'diagram');
const refs=mergePartPhotos(mergePartPhotos(first.images,second.images),diagrams.images),diagramSources=new Set(diagrams.images.map(i=>i.url)),items=[],errors=[];
console.log('Preparing '+refs.length+' unique references from the reviewed photo pages and diagram search.');
for(let start=0;start<refs.length;start+=3){await Promise.all(refs.slice(start,start+3).map(async ref=>{
 const id='alternator-'+createHash('sha256').update(ref.url).digest('hex').slice(0,14),destination=path.join(root,id+'.png'),temp=path.join(root,id+'.source');
 try{
  let existing=false;try{existing=(await stat(destination)).size>0;}catch{}
  if(!existing){const res=await fetch(ref.image,{headers:{'User-Agent':'OSP-AutoCare/1.0 (attributed local reference library)'},signal:AbortSignal.timeout(30000)});if(!res.ok)throw Error('Image response '+res.status);if(!res.headers.get('content-type')?.startsWith('image/'))throw Error('Non-image response');const bytes=new Uint8Array(await res.arrayBuffer());if(bytes.length>6000000)throw Error('Image too large');await writeFile(temp,bytes);await run('convert',['-limit','memory','128MiB',temp+'[0]','-auto-orient','-resize','600x600>','-strip','-define','png:compression-level=9','PNG24:'+destination]);await (await import('node:fs/promises')).unlink(temp);}
  const bytes=await readFile(destination);if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG output');
  const dimensions=(await run('identify',['-format','%w %h',destination])).stdout.trim().split(' ').map(Number);
  items.push({...ref,id,image:'/part-media/'+id+'.png',originalImage:ref.image,topics:['alternator','alternador'],kind:ref.title==='Automotive alternator.jpg'||diagramSources.has(ref.url)||/diagram|cutaway|cross.section/i.test(ref.title)?'diagram':'photo',format:'image/png',width:dimensions[0],height:dimensions[1],bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),conversion:'Converted to PNG, metadata stripped; resized only if over 600 px. Content preserved.',local:true});
 }catch(e){errors.push({url:ref.url,error:e.message});}
 }));console.log('Converted '+items.length+'/'+refs.length+'; failures '+errors.length);}
items.sort((a,b)=>a.id.localeCompare(b.id));
const manifest={version:1,created:new Date().toISOString(),scope:'Reviewed alternator photo pages (offsets 0 and 24) plus matching reference diagrams; not every image on the internet.',items,errors};
await writeFile('public/local-part-media.json',JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(root,'CREDITS.md'),'# OSP AutoCare · Local reference images\n\nThese reference images retain their original authors and licenses. They are not exact VIN-specific parts or OEM instructions. Conversion: local PNG copies, metadata stripped, maximum 600 px; no technical details added.\n\n'+items.map(i=>`## ${i.id}\n\n- Title: ${i.title}\n- Author: ${i.artist||'See original file page'}\n- Source: ${i.url}\n- Original thumbnail: ${i.originalImage}\n- License: ${i.license}\n- License URL: ${i.licenseUrl||i.url}\n- PNG: ${i.id}.png\n- Changes: ${i.conversion}\n`).join('\n'));
console.log(JSON.stringify({count:items.length,expected:refs.length,bytes:items.reduce((n,i)=>n+i.bytes,0),diagrams:items.filter(i=>i.kind==='diagram').length,failures:errors}));
if(errors.length)process.exitCode=1;
