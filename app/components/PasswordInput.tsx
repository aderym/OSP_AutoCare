'use client';
import {useState,type InputHTMLAttributes} from 'react';
import {Eye,EyeOff} from 'lucide-react';
export default function PasswordInput({lang=0,...props}:Omit<InputHTMLAttributes<HTMLInputElement>,'lang'>&{lang?:number}){const [visible,setVisible]=useState(false);const label=visible?(lang?'Ocultar contraseña':'Hide password'):(lang?'Mostrar contraseña':'Show password');return <span className="password-input"><input {...props} type={visible?'text':'password'}/><button type="button" aria-label={label} title={label} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span>;}
