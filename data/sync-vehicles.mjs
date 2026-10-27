// Node 24. Run: node data/sync-vehicles.mjs [make] [year]
import fs from 'node:fs/promises';
const base='https://vpic.nhtsa.dot.gov/api/vehicles/';
async function get(p){const r=await fetch(base+p+'?format=json');if(!r.ok)throw Error('NHTSA '+r.status);return r.json();}
await fs.mkdir('data/catalog',{recursive:true});const makes=await get('GetAllMakes');await fs.writeFile('data/catalog/makes.json',JSON.stringify({source:base,downloaded:new Date().toISOString(),...makes},null,2));console.log('Saved '+makes.Count+' make records.');
const [make,year]=process.argv.slice(2);if(make&&/^\d{4}$/.test(year)){const models=await get('GetModelsForMakeYear/make/'+encodeURIComponent(make)+'/modelyear/'+year);await fs.writeFile('data/catalog/models-'+make.replace(/[^a-z0-9]/gi,'_')+'-'+year+'.json',JSON.stringify(models,null,2));console.log('Saved '+models.Count+' models.');}
