'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ChevronRight,Search,Download,ZoomIn,ZoomOut} from 'lucide-react';
import {changePartsVehicle,vehicleModels,vehicleYears,type CatalogPart,type PartsCatalog,type PartsVehicle,type VehiclePartsIndex} from '../../lib/parts-browser';
import {partsAssemblies} from '../../lib/parts-assemblies';
import PartsAssemblyDiagram from './PartsAssemblyDiagram';
import VehicleBrandLogo from './VehicleBrandLogo';
import ComponentDrawing from './ComponentDrawing';
import {componentDrawingPath} from '../../lib/part-illustrations';

export default function VehiclePartsBrowser({lang,catalog,vehicle,onVehicle,onCategory,onPart,category}:{lang:number;catalog:PartsCatalog;vehicle:PartsVehicle;onVehicle:(v:PartsVehicle)=>void;onCategory:(v:string)=>void;onPart:(v:CatalogPart)=>void;category:string}) {
 const t=(en:string,es:string)=>lang?es:en;
 const [index,setIndex]=useState<VehiclePartsIndex>({}),[error,setError]=useState(false),[attempt,setAttempt]=useState(0),[makeFilter,setMakeFilter]=useState(''),[partFilter,setPartFilter]=useState(''),[selected,setSelected]=useState(''),[zoom,setZoom]=useState(1),[limit,setLimit]=useState(60),[drawingView,setDrawingView]=useState<'system'|'component'>('system');
 const drawing=useRef<HTMLDivElement>(null);
 useEffect(()=>{let active=true;fetch('/parts-vehicle-index.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(active)setIndex(d as VehiclePartsIndex);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[attempt]);
 const context=[category,vehicle.make,vehicle.model,vehicle.year].join('|');
 const [previousContext,setPreviousContext]=useState(context);
 if(previousContext!==context){setPreviousContext(context);setSelected('');setZoom(1);setPartFilter('');setLimit(60);setDrawingView('system');}
 const ready=!!vehicle.make&&!!vehicle.model&&!!vehicle.year;
 const models=vehicleModels(index,vehicle.make||'');
 const years=vehicleYears(index,vehicle.make||'',vehicle.model||'');
 const brands=Object.values(index).filter(b=>b.name.toLowerCase().includes(makeFilter.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
 const categoryParts=(catalog.parts||[]).filter((p:CatalogPart)=>p.category===category);
 const shownParts=categoryParts.filter((p:CatalogPart)=>[p.name,p.es,...(p.aliases||[])].join(' ').toLowerCase().includes(partFilter.toLowerCase()));
 const pieces=partsAssemblies[category]||[];
 const activePart=categoryParts.find(p=>p.id===selected);
 function update(field:'make'|'model'|'year',value:string){onVehicle(changePartsVehicle(vehicle,field,value));onCategory('');}
 function selectPart(part:CatalogPart){setSelected(part.id);setDrawingView('component');setZoom(1);onPart(part);}
 async function download(){if(drawingView==='component'&&activePart){const link=document.createElement('a');link.href=componentDrawingPath(activePart);link.download='OSP-'+activePart.id+'.svg';link.click();return;}const svg=drawing.current?.querySelector('svg');if(!svg)return;
  const copy=svg.cloneNode(true) as SVGElement;copy.setAttribute('color','#17242f');copy.setAttribute('width','920');copy.setAttribute('height','780');
  copy.querySelectorAll('.pab-marker').forEach(el=>{el.setAttribute('fill','#fff');el.setAttribute('stroke','#17242f');});
  copy.querySelectorAll('text').forEach(el=>{el.setAttribute('fill','#17242f');el.setAttribute('font-family','sans-serif');el.setAttribute('font-size','12');});
  try{await Promise.all(Array.from(copy.querySelectorAll('image')).map(async element=>{const href=element.getAttribute('href');if(!href)return;const response=await fetch(href);if(!response.ok)throw Error('Image unavailable');const blob=await response.blob();const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);});element.setAttribute('href',data);}));}catch{return;}

  const data=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}),url=URL.createObjectURL(data),a=document.createElement('a');
  a.href=url;a.download='OSP-'+category.replace(/[^a-z0-9]+/gi,'-')+'-generic.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className="pab" aria-label={t('Browse parts by vehicle','Buscar partes por vehículo')}>
  <nav className="pab-steps" aria-label={t('Selection steps','Pasos de selección')}>
   {[t('Make','Marca'),t('Model','Modelo'),t('Year','Año'),t('Parts & diagrams','Partes y diagramas')].map((name,i)=><span key={name} className={(i===0&&!vehicle.make||i===1&&vehicle.make&&!vehicle.model||i===2&&vehicle.model&&!vehicle.year||i===3&&ready)?'current':''}><b>{i+1}</b>{name}{i<3&&<ChevronRight size={14}/>}</span>)}
  </nav>
  <div className="pab-heading"><div><span className="eyebrow">{t('VEHICLE PARTS CATALOG','CATÁLOGO DE PARTES POR VEHÍCULO')}</span><h3>{ready?t('Choose a system, then a component','Seleccione un sistema y después una pieza'):t('Start with your vehicle','Empiece con su vehículo')}</h3></div>{vehicle.make&&<button type="button" className="text-btn" onClick={()=>{onVehicle({});onCategory('');}}><ArrowLeft size={15}/>{t('Change vehicle','Cambiar vehículo')}</button>}</div>
  {!vehicle.make&&<><label className="pab-brand-search"><Search size={17}/><input type="search" value={makeFilter} onChange={e=>setMakeFilter(e.target.value)} placeholder={t('Search makes…','Buscar marcas…')} aria-label={t('Search vehicle makes','Buscar marcas de vehículos')}/></label><div className="pab-brands">{brands.map(b=><button type="button" className="pab-brand" title={b.name} key={b.name} onClick={()=>update('make',b.name)}><VehicleBrandLogo make={b.name}/><strong>{b.name}</strong><ChevronRight size={15}/></button>)}</div>{!brands.length&&!error&&<p role="status">{Object.keys(index).length?t('No makes match your search.','No hay marcas coincidentes.'):t('Loading vehicle catalog…','Cargando catálogo de vehículos…')}</p>}</>}
  {error&&<p className="notice" role="status">{t('Could not load the vehicle list. Use VIN / vehicle details below or retry.','No cargó la lista de vehículos. Use VIN / datos del vehículo abajo o vuelva a intentar.')} <button type="button" className="text-btn" onClick={()=>{setError(false);setAttempt(v=>v+1);}}>{t('Retry','Reintentar')}</button></p>}
  {vehicle.make&&<div className="form-grid pab-vehicle-fields">
   <label>{t('Make','Marca')}<select aria-label={t('Make','Marca')} value={vehicle.make} onChange={e=>update('make',e.target.value)}><option value="">{t('Select make','Seleccione marca')}</option>{!Object.values(index).some(b=>b.name===vehicle.make)&&<option>{vehicle.make}</option>}{Object.values(index).sort((a,b)=>a.name.localeCompare(b.name)).map(b=><option key={b.name}>{b.name}</option>)}</select></label>
   <label>{t('Model','Modelo')}<select aria-label={t('Model','Modelo')} value={vehicle.model||''} onChange={e=>update('model',e.target.value)}><option value="">{t('Select model','Seleccione modelo')}</option>{vehicle.model&&!models.includes(vehicle.model)&&<option>{vehicle.model}</option>}{models.map(m=><option key={m}>{m}</option>)}</select></label>
   <label>{t('Year','Año')}<select aria-label={t('Year','Año')} value={vehicle.year||''} disabled={!vehicle.model} onChange={e=>update('year',e.target.value)}><option value="">{t('Select year','Seleccione año')}</option>{vehicle.year&&!years.includes(String(vehicle.year))&&<option>{vehicle.year}</option>}{years.map(y=><option key={y}>{y}</option>)}</select></label>
  </div>}
  {ready&&<><p className="pab-scope">{[vehicle.year,vehicle.make,vehicle.model].join(' ')} · {t('Generic system drawings · Verify exact configuration in an OEM catalog.','Dibujos generales por sistema · Confirme la configuración exacta en un catálogo OEM.')}</p>
   {!category?<div className="pab-systems">{(catalog.categories||[]).map((c:{en:string;es:string})=><button type="button" className="pab-system" key={c.en} onClick={()=>onCategory(c.en)}><PartsAssemblyDiagram category={c.en} compact/><span><strong>{lang?c.es:c.en}</strong><small>{(catalog.parts||[]).filter((p:CatalogPart)=>p.category===c.en).length} {t('components','componentes')}</small></span><ChevronRight size={16}/></button>)}</div>:<>
    <div className="pab-toolbar"><button type="button" className="secondary" onClick={()=>onCategory('')}><ArrowLeft size={15}/>{t('All systems','Todos los sistemas')}</button><h3>{(catalog.categories||[]).find((c:{en:string;es:string})=>c.en===category)?.[lang?'es':'en']||category}</h3><button type="button" className="icon-btn" onClick={()=>setZoom(z=>Math.max(1,z-.25))} disabled={zoom===1} aria-label={t('Zoom out','Alejar')}><ZoomOut size={18}/></button><span>{Math.round(zoom*100)}%</span><button type="button" className="icon-btn" disabled={zoom===2} onClick={()=>setZoom(z=>Math.min(2,z+.25))} aria-label={t('Zoom in','Acercar')}><ZoomIn size={18}/></button><button type="button" className="secondary" onClick={download}><Download size={15}/>{t('Transparent SVG','SVG sin fondo')}</button></div>
    <div className="pab-drawing-tabs" role="group" aria-label={t('Drawing view','Vista del dibujo')}><button type="button" className="secondary" aria-pressed={drawingView==='system'} onClick={()=>{setDrawingView('system');setZoom(1);}}>{t('System diagram','Diagrama del sistema')}</button><button type="button" className="secondary" disabled={!activePart} aria-pressed={drawingView==='component'} onClick={()=>{setDrawingView('component');setZoom(1);}}>{t('Selected component','Componente seleccionado')}</button></div>
    <div className="pab-assembly"><div className="pab-drawing-scroll">{drawingView==='component'&&activePart&&<div className="pab-component-heading"><h3>{lang?activePart.es:activePart.name}</h3><small>{lang?activePart.name:activePart.es}</small></div>}<div ref={drawing} className="pab-drawing" style={{width:`${zoom*100}%`}}>{drawingView==='component'&&activePart?<ComponentDrawing part={activePart} lang={lang}/>:<PartsAssemblyDiagram category={category} parts={categoryParts} lang={lang} onPart={selectPart} selectedId={selected}/>}</div><p className="field-help">{drawingView==='component'?t('Shaded 3D type illustration · Not OEM · Not to scale. Shape and connections vary by vehicle. Materials and operations show the product or application, not an installed component.','Ilustración 3D del tipo de pieza · No OEM · Sin escala. La forma y las conexiones varían por vehículo. Los materiales y procesos muestran el producto o su aplicación, no una pieza instalada.'):t('Original system schematic · Select any list entry to see its individual illustration.','Esquema original del sistema · Seleccione cualquier entrada de la lista para ver su ilustración individual.')}</p></div>
     <div className="pab-component-list"><label>{t('Find a component','Buscar componente')}<input type="search" value={partFilter} onChange={e=>{setPartFilter(e.target.value);setLimit(60);}} placeholder={t('Part name…','Nombre de parte…')}/></label><p className="field-help">{t('Select a part to search photos, inventory and suppliers.','Seleccione una pieza para buscar fotos, inventario y proveedores.')}</p>{shownParts.slice(0,limit).map((p:CatalogPart)=>{const n=pieces.findIndex(s=>s.name.toLowerCase()===p.name.toLowerCase());return <button type="button" key={p.id} aria-pressed={selected===p.id} className="pab-component" onClick={()=>selectPart(p)}><span className="pab-component-number">{n<0?'—':n+1}</span><ComponentDrawing part={p} lang={lang} thumbnail/><span className="pab-component-label"><strong>{lang?p.es:p.name}</strong><small>{lang?p.name:p.es}</small></span><ChevronRight size={14}/></button>;})}{!shownParts.length&&<p>{t('No components found.','Sin componentes coincidentes.')}</p>}{shownParts.length>limit&&<button type="button" className="text-btn" onClick={()=>setLimit(v=>v+60)}>{t('Show more','Mostrar más')}</button>}</div>
    </div>
   </>}
  </>}
 </section>;
}
