/** Explicit arrays preserve multi-word makes such as Land Rover and Mercedes-Benz. */
export function resourceBrands(resource:any):string[]{return Array.isArray(resource.brands)?resource.brands.filter((v:any)=>typeof v==='string'&&v.trim()):resource.makes==='all'?[]:String(resource.makes||'').split(/\s*[/,;|]\s*/).filter(Boolean);}
const normalize=(value:string)=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function resourceMatchesMake(resource:any,make:string){return resource.makes==='all'||!make||resourceBrands(resource).some(brand=>normalize(brand)===normalize(make));}
