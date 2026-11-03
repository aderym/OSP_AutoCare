import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {detailedComponentModel} from '../lib/component-models.ts';
import {renderComponentSVG} from '../lib/component-render.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'public/parts-catalog.json'),'utf8'));
const out=path.join(root,'public/part-drawings'),models=path.join(out,'models');fs.mkdirSync(models,{recursive:true});
const entries=[],assets={},rendered=new Set();
for(const part of catalog.parts){
 const model=detailedComponentModel(part);
 if(!model?.faces.length)throw Error('No isolated model: '+part.name);
 for(const face of model.faces)for(const point of face.points)if(!point.every(Number.isFinite))throw Error('Invalid model coordinates: '+part.name);
 const hash=createHash('sha256').update(JSON.stringify(model.faces)).digest('hex').slice(0,12),key=model.family+'-'+hash;
 const vector='/part-drawings/models/'+key+'.svg',image='/part-drawings/models/'+key+'.webp',thumbnail='/part-drawings/models/'+key+'-thumb.webp';
 if(!rendered.has(key)){fs.writeFileSync(path.join(models,key+'.svg'),renderComponentSVG(model.faces,'OSP AutoCare · Generic 3D component illustration / Ilustración 3D general',model.family));rendered.add(key);}
 assets[part.id]={vector,image,thumbnail};
 entries.push({componentId:part.id,name:part.name,es:part.es,category:part.category,family:model.family,modelKey:key,image,thumbnail,vector,faceCount:model.faces.length,style:'shaded-perspective-3d',scope:'generic-type',oem:false});
 // Replace the earlier generated symbol, retaining catalog identity and new mapping.
 fs.rmSync(path.join(out,part.id+'.svg'),{force:true});
}
for(const file of fs.readdirSync(models)){const key=file.replace(/-thumb\.webp$|\.webp$|\.svg$/,'');if(!rendered.has(key))fs.rmSync(path.join(models,file),{force:true});}
fs.writeFileSync(path.join(out,'assets.json'),JSON.stringify(assets,null,2)+'\n');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({version:2,creator:'OSP AutoCare',license:'CC0-1.0',entries},null,2)+'\n');
fs.writeFileSync(path.join(out,'ATTRIBUTION.txt'),'Original OSP AutoCare isolated 3D type models and shaded perspective illustrations, CC0-1.0. Generic references, not vehicle-specific OEM diagrams or verified VIN fitment. Materials and operations depict products or applications. No background is included.\n');
console.log(`Generated ${entries.length} component mappings to ${rendered.size} detailed isolated models, ${new Set(entries.map(x=>x.family)).size} families. Run scripts/render-component-drawings.py to create raster previews.`);
