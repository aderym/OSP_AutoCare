// Deterministic narration of scoped search results; no generative model or API key.
export function localReplyText(data:any,lang:number){
 const es=!!lang,parts=(data.parts||[]).slice(0,4),matches=(data.matches||[]).slice(0,4),resources=(data.resources||[]).slice(0,3);
 const lines=[es?'Consulta local basada en el catálogo y los registros disponibles del taller.':'Local lookup based on the catalog and available workshop records.'];
 if(data.part)lines.push(`${es?data.part.es||data.part.name:data.part.name}. ${es?'Zona ilustrativa: '+data.part.approximateAreaEs:'Illustrative area: '+data.part.approximateArea}.`);
 if(parts.length)lines.push((es?'Partes coincidentes: ':'Matching parts: ')+parts.map((p:any)=>es?p.es||p.name:p.name).join(', ')+'.');
 if(matches.length)lines.push((es?'Registros encontrados: ':'Matching records: ')+matches.map((m:any)=>[m.title,m.summary].filter(Boolean).join(': ')).join('. ')+'.');
 else lines.push(es?'No encontré registros coincidentes en este taller.':'No matching records were found in this workshop.');
 if(resources.length)lines.push((es?'Referencias disponibles para consultar: ':'Available references to consult: ')+resources.map((r:any)=>r.name).join(', ')+'.');
 lines.push(es?'Este modo no genera procedimientos de reparación ni analiza fotos. Para instrucciones exactas, seleccione año, marca, modelo y motor y consulte el manual correspondiente.':'This mode does not generate repair procedures or analyze photos. For exact instructions, select the year, make, model and engine and consult the appropriate manual.');
 return lines.join('\n\n');
}
