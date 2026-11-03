import type {CatalogPart} from '../../lib/parts-browser';
import {componentImagePath} from '../../lib/part-illustrations';

export default function ComponentDrawing({part,lang=0,thumbnail=false}:{part:CatalogPart;lang?:number;thumbnail?:boolean}) {
 const name=lang?part.es:part.name;
 return <img className={thumbnail?'component-drawing-thumbnail':'component-drawing-image'} src={componentImagePath(part,thumbnail)} alt={thumbnail?'':name+(lang?' · dibujo general del componente':' · generic component illustration')} aria-hidden={thumbnail?true:undefined} width={thumbnail?68:960} height={thumbnail?48:700} loading={thumbnail?'lazy':'eager'} decoding="async"/>;
}
