export function normalizePartText(value:string){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
export function partDomain(part:any){return part.category==='Paint & refinishing'?'paint':['Body & collision','Interior & safety'].includes(part.category)?'body':'mechanical';}
export function filterParts(parts:any[],query='',category='',domain='all'){
 const words=normalizePartText(query).trim().split(/\s+/).filter(Boolean);
 return parts.filter(p=>(!category||p.category===category)&&(domain==='all'||partDomain(p)===domain)&&words.every(w=>normalizePartText([p.name,p.es,...(p.aliases||[])].join(' ')).includes(w)));
}
export function paintTargets(parts:any[]){return parts.filter(p=>p.category==='Body & collision'&&/^(hood|roof panel|left front fender|right front fender|left rear quarter panel|right rear quarter panel|left rocker panel|right rocker panel|left front door shell|right front door shell|left rear door shell|right rear door shell|front bumper cover|rear bumper cover|trunk lid|liftgate|tailgate|pickup bedside panel|pickup bed floor|floor pan repair panel|a-pillar outer panel|b-pillar outer panel|c-pillar outer panel)$/.test(p.name.toLowerCase()));}
