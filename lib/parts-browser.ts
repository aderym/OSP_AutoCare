export type CatalogPart = {id:string;name:string;es:string;category:string;aliases?:string[]};
export type PartsCatalog = {parts:CatalogPart[];categories:{en:string;es:string}[]};
export type PartsVehicle = {make?:string;model?:string;year?:string;engine?:string;epaId?:string;transmission?:string;drive?:string;fuelType?:string;bodyClass?:string;vin?:string;trim?:string;[key:string]:unknown};
export type VehiclePartsIndex = Record<string, {name:string; models:Record<string,string[]>}>;
export function vehicleModels(index:VehiclePartsIndex, make:string) {
  return Object.keys(index[make.toLowerCase()]?.models || {}).sort((a,b)=>a.localeCompare(b));
}
export function vehicleYears(index:VehiclePartsIndex, make:string, model:string) {
  return [...(index[make.toLowerCase()]?.models[model] || [])].sort((a,b)=>Number(b)-Number(a));
}
/** Changing an identity field invalidates every dependent configuration field. */
export function changePartsVehicle(value:PartsVehicle, field:'make'|'model'|'year', next:string) {
  const result = {...value, [field]:next, engine:'', epaId:'', transmission:'', drive:'', fuelType:'', bodyClass:'', vin:'', trim:''};
  if(field==='make') {result.model=''; result.year='';}
  if(field==='model') result.year='';
  return result;
}
