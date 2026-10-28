// Invoice identity stays inside the existing per-workshop JSON profile.
export const identityFields = ['legalName','taxId','registrationNumber','licenseNumber','ownerName','email','phone','address','city','region','postalCode','country','website','invoiceTerms'] as const;
export function businessProfile(body:any,previous:any={}){
 const result:any={...previous};
 for(const k of identityFields)if(body[k]!==undefined){if(typeof body[k]!=='string'||body[k].length>(k==='invoiceTerms'?2000:k==='address'?500:254))throw Error('Invalid business field / Campo del negocio inválido: '+k);result[k]=body[k].trim();}
 if(body.logo!==undefined){if(typeof body.logo!=='string'||body.logo&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(body.logo)||body.logo.length>=1000000))throw Error('Logo: PNG/JPG/WebP under 700 KB / Logo inválido');result.logo=body.logo;}
 if(body.tax!==undefined){const tax=Number(body.tax);if(!Number.isFinite(tax)||tax<0||tax>100)throw Error('Tax must be 0–100% / Impuesto de 0–100%');result.tax=tax;}
 return result;
}
