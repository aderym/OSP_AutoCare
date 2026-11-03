import {normalizePartText} from './parts-search.ts';
export type PartsContext={year?:string;make?:string;model?:string;engine?:string;trim?:string;vin?:string};
export function cleanPartsContext(v:any={}):PartsContext{return Object.fromEntries(['year','make','model','engine','trim','vin'].map(k=>[k,String(v[k]||'').trim().slice(0,k==='vin'?25:100)]));}
export function partSearchText(query:string,v:PartsContext={}){return [v.year,v.make,v.model,query].filter(Boolean).join(' ').replace(/\b[A-HJ-NPR-Z0-9]{17}\b/gi,'').trim().slice(0,250);}
export function providerMatches(provider:any,make:string){return !make||!provider.brands?.length||provider.brands.some((b:string)=>normalizePartText(b)===normalizePartText(make));}
export function providerSearchUrl(provider:any,query:string,v:PartsContext={},sendVin=false){
 if(provider.id==='partsouq'&&(sendVin&&v.vin||query.trim()))return 'https://partsouq.com/en/search/all?q='+encodeURIComponent(sendVin&&v.vin?v.vin:query.trim());
 if(provider.id==='ebay')return 'https://www.ebay.com/sch/i.html?'+new URLSearchParams({_nkw:partSearchText(query,v),_sacat:'6000'});
 const host=new URL(provider.url).hostname;
 return 'https://www.google.com/search?'+new URLSearchParams({q:'site:'+host+' '+partSearchText(query,v)});
}
export function localPartMatches(items:any[],query:string){const terms=normalizePartText(query).trim().split(/\s+/).filter(Boolean);return items.filter(p=>terms.every(q=>normalizePartText([p.name,p.es,p.sku,...(p.aliases||[])].join(' ')).includes(q)));}
export function safeRemoteUrl(value:string,hosts:string[]){try{const u=new URL(value);return u.protocol==='https:'&&hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h))?u.href:'';}catch{return '';}}
export function normalizeEbayItem(item:any){return {id:String(item.itemId||''),name:String(item.title||'').slice(0,300),url:safeRemoteUrl(item.itemWebUrl,['ebay.com']),image:safeRemoteUrl(item.image?.imageUrl,['ebayimg.com']),price:item.price?.value&&Number.isFinite(Number(item.price.value))?{value:Number(item.price.value),currency:String(item.price.currency||'USD')}:null,condition:String(item.condition||''),supplier:'eBay',seller:String(item.seller?.username||''),compatibility:String(item.compatibilityMatch||'UNKNOWN'),compatibilityProperties:Array.isArray(item.compatibilityProperties)?item.compatibilityProperties.map((p:any)=>({name:String(p.name||''),value:String(p.value||'')})):[],shipping:item.shippingOptions?.[0]?.shippingCost?{value:Number(item.shippingOptions[0].shippingCost.value),currency:String(item.shippingOptions[0].shippingCost.currency)}:null};}
let ebayToken:{key:string;token:string;until:number}|null=null;
export async function searchEbay(query:string,vehicle:PartsContext,credentials:{appId:string;secret:string},request:typeof fetch=fetch){
 const identity=credentials.appId+':'+credentials.secret;
 let accessToken=ebayToken?.key===identity&&ebayToken.until>Date.now()?ebayToken.token:'';
 if(!accessToken){const auth=await request('https://api.ebay.com/identity/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+btoa(credentials.appId+':'+credentials.secret),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',scope:'https://api.ebay.com/oauth/api_scope'}),signal:AbortSignal.timeout(12000)});
 if(!auth.ok)throw Error('eBay authorization failed / Falló la autorización eBay');const token:any=await auth.json();if(!token.access_token)throw Error('Invalid eBay token response');accessToken=token.access_token;ebayToken={key:identity,token:accessToken,until:Date.now()+Math.max(0,Math.min(Number(token.expires_in)||0,7200)-60)*1000};}
 const params=new URLSearchParams({q:partSearchText(query,vehicle),category_ids:'6000',limit:'24'});
 // eBay can return partial and unknown compatibility, never label all search results as fitting.
 const fields=[['Year',vehicle.year],['Make',vehicle.make],['Model',vehicle.model]].filter(([,v])=>v).map(([k,v])=>k+':'+String(v).replace(/[;:{}|]/g,' '));if(fields.length)params.set('compatibility_filter',fields.join(';'));
 const res=await request('https://api.ebay.com/buy/browse/v1/item_summary/search?'+params,{headers:{Authorization:'Bearer '+accessToken,'X-EBAY-C-MARKETPLACE-ID':'EBAY_US'},signal:AbortSignal.timeout(15000)});
 if(!res.ok)throw Error('eBay search unavailable ('+res.status+') / Búsqueda eBay no disponible');const d:any=await res.json();return {items:(d.itemSummaries||[]).map(normalizeEbayItem).filter((i:any)=>i.id&&i.url),total:Number(d.total)||0,fetchedAt:new Date().toISOString()};
}
const text=(s:any)=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').slice(0,400);
export function normalizeCommons(d:any,kind:'photo'|'diagram'='photo'){return Object.values(d.query?.pages||{}).sort((a:any,b:any)=>(a.index||0)-(b.index||0)).flatMap((p:any)=>{const i=p.imageinfo?.[0],m=i?.extmetadata||{},image=safeRemoteUrl(i?.thumburl||'',['upload.wikimedia.org','thumb.wikimedia.org']),url=safeRemoteUrl(i?.descriptionurl||'',['commons.wikimedia.org']);const fileTitle=String(p.title||'');const drawable=/\.(png|jpe?g|webp|gif|svg|tiff?)$/i.test(fileTitle);const isDiagram=/diagram|schematic|cutaway|cross.section|exploded/i.test([fileTitle,m.ImageDescription?.value,m.Categories?.value].join(' '));return drawable&&(kind!=='diagram'||isDiagram)&&image&&url&&m.LicenseShortName?.value?[{title:text(p.title?.replace(/^File:/,'')),image,url,artist:text(m.Artist?.value),license:text(m.LicenseShortName.value),licenseUrl:safeRemoteUrl(m.LicenseUrl?.value||'',['creativecommons.org','commons.wikimedia.org','gnu.org'])}]:[];});}
export function mediaPageOffset(value:unknown){const offset=Number(value??0);if(!Number.isInteger(offset)||offset<0||offset>10000)throw Error('Invalid image page / Página de imágenes inválida');return offset;}
export function mergePartPhotos(current:any[],incoming:any[]){return [...new Map([...current,...incoming].map(p=>[p.url,p])).values()];}
export async function searchPartMediaPage(query:string,request:typeof fetch=fetch,kind:'photo'|'diagram'='photo',offset=0){
 const clean=query.slice(0,100).replace(/["|()]/g,' '),page=mediaPageOffset(offset);
 const search=kind==='diagram'?'"'+clean+'" automobile diagram':query.toLowerCase()==='alternator'?'incategory:"Automobile alternators" filetype:bitmap':'"'+clean+'" automobile filetype:bitmap'+(!/tester/i.test(query)?' -intitle:tester':'');
 const params=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:search,gsrnamespace:'6',gsrlimit:kind==='photo'?'24':'12',gsroffset:String(page),prop:'imageinfo',iiprop:'url|extmetadata',iiextmetadatafilter:'Artist|LicenseShortName|LicenseUrl|ImageDescription|Categories',iiurlwidth:'500'});
 const res=await request('https://commons.wikimedia.org/w/api.php?'+params,{headers:{'User-Agent':'OSP-AutoCare/1.0 (automotive reference images)'},signal:AbortSignal.timeout(15000)});
 if(!res.ok)throw Error('Image search unavailable / Imágenes no disponibles');const d:any=await res.json();if(d.error)throw Error('Image search unavailable / Imágenes no disponibles');
 const next=Number(d.continue?.gsroffset);return {images:normalizeCommons(d,kind),nextOffset:Number.isInteger(next)&&next>page&&next<=10000?next:null};
}
export async function searchPartPhotos(query:string,request:typeof fetch=fetch,kind:'photo'|'diagram'='photo'){return (await searchPartMediaPage(query,request,kind)).images;}

export function localPartMedia(items:any[],query:string){const term=normalizePartText(query).trim();if(!term)return [];return items.filter(p=>(p.topics||[]).some((topic:string)=>normalizePartText(topic).trim()===term));}
export function mergePartMedia(local:any[],remote:any[]){return [...new Map([...remote,...local].map(p=>[p.url,p])).values()];}
