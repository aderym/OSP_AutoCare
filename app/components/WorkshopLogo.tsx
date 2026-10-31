'use client';
import {useEffect,useState} from 'react';
export default function WorkshopLogo({shop,compact=false,lang=0}:{shop:any,compact?:boolean,lang?:number}){
 let profile:any=shop?.profile||{};if(typeof profile==='string'){try{profile=JSON.parse(profile);}catch{profile={};}}
 const source=typeof profile?.logo==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(profile.logo)?profile.logo:'';
 const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[source]);
 const name=String(shop?.name||'Workshop'),initials=name.trim().split(/\s+/).slice(0,2).map((p:string)=>Array.from(p)[0]||'').join('').toUpperCase();
 return <span className={'workshop-logo '+(compact?'compact':'')}>
 {source&&!failed?<img src={source} alt={(lang?'Logo de ':'Logo for ')+name} onError={()=>setFailed(true)}/>:<span role="img" aria-label={name}>{initials||'W'}</span>}
 </span>;
}
