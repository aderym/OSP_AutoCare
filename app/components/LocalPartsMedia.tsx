'use client';
import {useState} from 'react';
import {mediaVehicleLabel, searchLocalPartMedia, type LocalPartMedia} from '../../lib/parts-media';

export default function LocalPartsMedia({lang, query, category, componentIds, vehicle, onPhoto}: {
  lang: number; query: string; category: string; componentIds: string[];
  vehicle: {year?: string; make?: string; model?: string}; onPhoto: (media: Omit<LocalPartMedia, 'kind'> & {title: string; kind: 'local'; mediaKind: string}) => void;
}) {
  const t = (en: string, es: string) => lang ? es : en;
  const [kind, setKind] = useState('illustration');
  // Keyed by query/category in the parent: pagination resets when the search changes.
  const [limit, setLimit] = useState(24);
  const media = searchLocalPartMedia(query, {category, componentIds, kind});
  const context = mediaVehicleLabel(vehicle);
  return <section className="panel pf-local-media" aria-label={t('Local image library', 'Biblioteca local de imágenes')}>
    <header><div><span className="eyebrow">{t('INCLUDED PNG LIBRARY', 'BIBLIOTECA PNG INTEGRADA')}</span>
      <h3>{t('Component illustrations & diagrams', 'Ilustraciones y diagramas de componentes')}</h3></div>
      <span className="badge">{media.length} {t('local images', 'imágenes locales')}</span></header>
    <p className="field-help">{t('Original generic references · Not OEM · Images do not verify VIN fitment. Confirm the OEM number, engine, position and supplier before ordering.', 'Referencias genéricas originales · No OEM · Las imágenes no verifican compatibilidad por VIN. Confirme número OEM, motor, posición y proveedor antes de pedir.')}</p>
    {context && <p className="field-help">{t('Selected vehicle', 'Vehículo seleccionado')}: {context}. {t('Shown as search context only; these images are not specific to this vehicle.', 'Solo es contexto de búsqueda; estas imágenes no son específicas de este vehículo.')}</p>}
    <div className="pf-tabs" role="group" aria-label={t('Local image type', 'Tipo de imagen local')}>
      {[['illustration', t('Illustrations', 'Ilustraciones')], ['diagram', t('Annotated diagrams', 'Diagramas anotados')], ['', t('All images', 'Todas las imágenes')]].map(([value, label]) =>
        <button key={value} type="button" className="secondary" aria-pressed={kind === value} onClick={() => {setKind(value); setLimit(24);}}>{label}</button>)}
    </div>
    <div className="pf-local-media-grid">{media.slice(0, limit).map(item => {
      const title = lang ? item.es : item.name;
      const label = item.kind === 'diagram' ? t('Illustrative diagram · Not OEM', 'Diagrama ilustrativo · No OEM') : t('Original illustration', 'Ilustración original');
      return <figure key={item.id}>
        <button type="button" className="pf-image-button" onClick={() => onPhoto({...item, title, kind: 'local', mediaKind: item.kind})} aria-label={t('Enlarge image: ', 'Ampliar imagen: ') + title + ' · ' + label}>
          {/* Static PNGs must work without the Next image optimizer or external services. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} width="640" height={item.kind === 'diagram' ? 490 : 400} alt={title + ' · ' + label} loading="lazy" decoding="async" onError={event => {event.currentTarget.hidden = true;}}/>
        </button>
        <figcaption><strong>{title}</strong><span>{label}</span><small>{item.componentId} · {item.artist} · <a href={item.licenseUrl} target="_blank" rel="noopener noreferrer">{item.license}</a></small>
          <a href={item.image} download>{t('Download PNG', 'Descargar PNG')}</a></figcaption>
      </figure>;
    })}</div>
    {!media.length && <p className="notice">{t('This selection has no included PNG yet. Local catalog references and complementary internet search remain available.', 'Esta selección todavía no incluye un PNG. Las referencias del catálogo local y la búsqueda complementaria en internet siguen disponibles.')}</p>}
    {media.length > limit && <button type="button" className="secondary" onClick={() => setLimit(value => value + 24)}>{t('Show more local images', 'Mostrar más imágenes locales')}</button>}
  </section>;
}
