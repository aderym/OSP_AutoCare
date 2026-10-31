/** Explicit arrays preserve multi-word makes such as Land Rover and Mercedes-Benz. */
export function resourceBrands(resource:any):string[]{return Array.isArray(resource.brands)?resource.brands.filter((v:any)=>typeof v==='string'&&v.trim()):resource.makes==='all'?[]:String(resource.makes||'').split(/\s*[/,;|]\s*/).filter(Boolean);}
const normalize=(value:string)=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function resourceMatchesMake(resource:any,make:string){return resource.makes==='all'||!make||resourceBrands(resource).some(brand=>normalize(brand)===normalize(make));}

/** Repair known historical entry URLs without altering deep links to documents. */
export function referenceUrl(value:string):string{
 try{const url=new URL(value);
  if(url.hostname==='bmwtechinfo.bmwgroup.com'&&url.pathname==='/')url.pathname='/tisUI/';
  if(['www.minitechinfo.com','minitechinfo.com'].includes(url.hostname)&&['/','/tisUI/','/tisUI'].includes(url.pathname)){url.hostname='minitechinfo.bmwgroup.com';url.pathname='/tisUI/';}
  if(['www.realoem.com','realoem.com'].includes(url.hostname)&&['/bmw/','/bmw'].includes(url.pathname)){url.hostname='www.realoem.com';url.pathname='/bmw/enUS/select';}
  return url.toString();
 }catch{return value;}
}
export function sameReference(a:string,b:string){return referenceUrl(a)===referenceUrl(b);}
export function filterResources(resources:any[],{make='',category='',access='',query=''}:{make?:string;category?:string;access?:string;query?:string}){
 const text=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const terms=text(query.trim()).split(/\s+/).filter(Boolean);
 return resources.filter(r=>resourceMatchesMake(r,make)&&(!category||r.category===category)&&(!access||r.access===access)&&terms.every(term=>text([r.name,r.makes,r.description,r.es,r.category].join(' ')).includes(term)));
}
