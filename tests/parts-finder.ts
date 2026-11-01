import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cleanPartsContext,partSearchText,providerMatches,providerSearchUrl,localPartMatches,normalizeEbayItem,normalizeCommons,searchEbay,searchPartPhotos} from '../lib/parts-finder.ts';
const providers=JSON.parse(fs.readFileSync('public/parts-providers.json','utf8')).providers;
assert.equal(providers.length,37);assert.equal(new Set(providers.map((p:any)=>p.id)).size,37);
const amayama=providers.find((p:any)=>p.id==='amayama');assert(amayama);assert(providers.some((p:any)=>p.type==='Used'));assert(providers.some((p:any)=>p.type==='Paint'));
for(const p of providers){assert.equal(new URL(p.url).protocol,'https:');assert(p.description&&p.es);}
const vehicle=cleanPartsContext({year:'2020',make:'Toyota',model:'Camry',vin:'1HGCM82633A004352',customer:'PRIVATE_CUSTOMER'});
assert(!('customer' in vehicle));assert(!partSearchText('alternator',vehicle).includes(vehicle.vin!));
assert(!providerSearchUrl(amayama,'alternator',vehicle).includes(vehicle.vin!));
const ps=providers.find((p:any)=>p.id==='partsouq');assert(!providerSearchUrl(ps,'alternator',vehicle).includes(vehicle.vin!));assert(providerSearchUrl(ps,'',vehicle,true).includes(vehicle.vin!));
assert(providerMatches(providers.find((p:any)=>p.id==='realoem'),'BMW'));assert(!providerMatches(providers.find((p:any)=>p.id==='realoem'),'Toyota'));
const parts=JSON.parse(fs.readFileSync('public/parts-catalog.json','utf8')).parts;assert(localPartMatches(parts,'alternador').some((p:any)=>p.name==='Alternator'));
const bad=normalizeEbayItem({itemWebUrl:'javascript:alert(1)',image:{imageUrl:'https://evil.example/image'},title:'x'});assert.equal(bad.url,'');assert.equal(bad.image,'');assert.equal(bad.compatibility,'UNKNOWN');
const calls:any[]=[];const mock:typeof fetch=async(input:any,options:any)=>{calls.push({input:String(input),options});return new Response(JSON.stringify(calls.length===1?{access_token:'mock-token',expires_in:7200}:{total:1,itemSummaries:[{itemId:'sample',title:'Alternator',itemWebUrl:'https://www.ebay.com/itm/1',image:{imageUrl:'https://i.ebayimg.com/example.jpg'},price:{value:'80.50',currency:'USD'},compatibilityMatch:'PARTIAL',seller:{username:'sample-seller'}}]}),{status:200});};
const result=await searchEbay('alternator',vehicle,{appId:'mock-client',secret:'mock-secret'},mock);assert.equal(result.items[0].price.value,80.5);assert.equal(result.items[0].compatibility,'PARTIAL');assert.equal(calls.length,2);assert(!calls[1].input.includes(vehicle.vin!));assert(calls[1].input.includes('compatibility_filter'));assert(!JSON.stringify(result).includes('mock-token'));
await searchEbay('oil filter',vehicle,{appId:'mock-client',secret:'mock-secret'},mock);assert.equal(calls.length,3,'reuses valid OAuth token');
const commons={query:{pages:{1:{title:'File:Alternator.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/a/a1/Alternator.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Alternator.jpg',extmetadata:{ImageDescription:{value:'Diagram drawing of an automobile alternator'},Artist:{value:'<a>Example author</a>'},LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'}}}]}}}};
const pics=normalizeCommons(commons);assert.equal(pics[0].artist,'Example author');assert(pics[0].license);assert.equal(normalizeCommons({query:{pages:{1:{imageinfo:[{thumburl:'https://evil.example/img'}]}}}}).length,0);
let photoUrl='';await searchPartPhotos('alternator',async(input:any)=>{photoUrl=String(input);return new Response(JSON.stringify(commons));});assert(!photoUrl.includes(vehicle.vin!));
await assert.rejects(()=>searchEbay('part',{}, {appId:'different-client',secret:'different-secret'},async()=>new Response('{}',{status:401})),/authorization/);
console.log('Parts finder passed: 37 sources, bilingual matches, private VIN controls, API normalization, OAuth reuse and licensed image metadata.');

let diagramQuery='';const diagramImages=await searchPartPhotos('alternator',async(input:any)=>{diagramQuery=new URL(String(input)).searchParams.get('gsrsearch')||'';return new Response(JSON.stringify(commons));},'diagram');assert(diagramQuery.includes('diagram'));assert.equal(diagramImages.length,1);assert(!diagramQuery.includes(vehicle.vin!));

assert.equal(normalizeCommons({query:{pages:{1:{title:'File:Book.pdf',imageinfo:[{thumburl:'https://upload.wikimedia.org/book.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Book.pdf',extmetadata:{LicenseShortName:{value:'Public domain'}}}]}}}},'diagram').length,0,'book covers are not part diagrams');
