'use client';
import {useState} from 'react';
import {Car} from 'lucide-react';
import manifest from '../../public/vehicle-brand-logos/manifest.json';

const logos:Record<string,{image:string}>=manifest.logos;
export default function VehicleBrandLogo({make}:{make:string}) {
 const image=logos[make.trim().toLowerCase()]?.image;
 const [failed,setFailed]=useState(false);
 return <span className={image&&!failed?'pab-brand-logo':'pab-brand-logo pab-brand-logo-fallback'} aria-hidden="true">
  {image&&!failed?<img src={image} alt="" width="56" height="42" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<Car size={26} strokeWidth={1.4}/>}
 </span>;
}
