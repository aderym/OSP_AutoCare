'use client';
import type {CatalogPart} from '../../lib/parts-browser';
import catalog from '../../public/parts-catalog.json';
import {componentImagePath} from '../../lib/part-illustrations';
import {partsAssemblies} from '../../lib/parts-assemblies';

export default function PartsAssemblyDiagram({category,parts=[],lang=0,onPart,selectedId='',compact=false}:{category:string;parts?:CatalogPart[];lang?:number;onPart?:(part:CatalogPart)=>void;selectedId?:string;compact?:boolean}) {
 const pieces=partsAssemblies[category]||[];
 const available=parts.length?parts:catalog.parts.filter(part=>part.category===category);
 const label=lang?'Diagrama general de conjunto: ':'Generic assembly diagram: ';
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 480 400" className="pab-diagram" role={onPart&&!compact?'group':'img'} aria-label={label+category}>
  <title>{label+category}</title>
  <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
   {pieces.map((piece,i)=>{
    const part=available.find(p=>p.name.toLowerCase()===piece.name.toLowerCase());
    const interactive=!!onPart&&!!part&&!compact;
    const activate=()=>{if(interactive)onPart!(part);};
    return <g key={piece.name} transform={`translate(${piece.x} ${piece.y})`} className={selectedId&&selectedId===part?.id?'pab-piece is-active':'pab-piece'} role={interactive?'button':undefined} tabIndex={interactive?0:undefined} aria-label={interactive?(lang?part.es:part.name):undefined} onClick={activate} onKeyDown={interactive?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}}:undefined}>
     <title>{part?(lang?part.es:part.name):piece.name}</title>
     <image href={part?componentImagePath(part,true):undefined} x="-83" y="-54" width="166" height="108" preserveAspectRatio="xMidYMid meet"/>
     {!compact&&<><path className="pab-leader" d="M32-35l16-14h14"/><circle className="pab-marker" cx="73" cy="-49" r="12"/><text className="pab-number" x="73" y="-45" textAnchor="middle" stroke="none">{i+1}</text></>}
    </g>;
   })}
  </g>
 </svg>;
}
