export const MAX_MEDIA_BYTES=750000;
export function decodeAssistantMedia(value:unknown,kind:'image'|'audio'){
 if(typeof value!=='string'||value.length>1000100)throw Error('Media must be under 750 KB / Archivo de menos de 750 KB');
 const match=/^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
 const allowed=kind==='image'?['image/jpeg','image/png','image/webp']:['audio/webm','audio/mp4','audio/wav','audio/x-wav'];
 if(!match||!allowed.includes(match[1])||match[2].length%4!==0)throw Error('Unsupported media format / Formato no compatible');
 let binary:string;try{binary=atob(match[2]);}catch{throw Error('Invalid media encoding / Archivo inválido');}
 if(!binary.length||binary.length>MAX_MEDIA_BYTES)throw Error('Media must be under 750 KB / Archivo de menos de 750 KB');
 const mime=match[1],byte=(i:number)=>binary.charCodeAt(i),prefix=(p:string,i=0)=>binary.slice(i,i+p.length)===p;
 const valid=mime==='image/jpeg'?byte(0)===255&&byte(1)===216&&byte(2)===255:mime==='image/png'?prefix('\x89PNG\r\n\x1a\n'):mime==='image/webp'?prefix('RIFF')&&prefix('WEBP',8):mime==='audio/webm'?prefix('\x1a\x45\xdf\xa3'):mime==='audio/mp4'?prefix('ftyp',4):prefix('RIFF')&&prefix('WAVE',8);
 if(!valid)throw Error('Media content does not match its format / Contenido de archivo inválido');
 const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=byte(i);
 return {mime,bytes,extension:mime==='audio/mp4'?'mp4':mime==='audio/webm'?'webm':'wav'};
}
export const photoSuppliers=[
 {id:'autozone',name:'AutoZone',url:'https://www.autozone.com/',type:'New'},
 {id:'napa',name:'NAPA Auto Parts',url:'https://www.napaonline.com/',type:'New'},
 {id:'rockauto',name:'RockAuto',url:'https://www.rockauto.com/',type:'New'},
 {id:'fcpeuro',name:'FCP Euro',url:'https://www.fcpeuro.com/',type:'New'},
 {id:'lkq',name:'LKQ',url:'https://lkqcorp.com/buyparts/',type:'Used'},
 {id:'carpart',name:'Car-Part.com',url:'https://www.car-part.com/',type:'Used'},
 {id:'jasper',name:'JASPER',url:'https://www.jasperengines.com/',type:'Remanufactured'}
];
