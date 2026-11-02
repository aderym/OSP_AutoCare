import manifest from '../public/parts-media/manifest.json' with {type:'json'};
import {localPartMatches} from './parts-finder.ts';

export type LocalPartMedia = (typeof manifest.media)[number];
export const localPartMedia: readonly LocalPartMedia[] = manifest.media;

/** Pure local lookup: vehicle identity never implies fitment or leaves the browser. */
export function searchLocalPartMedia(query = '', options: {
  category?: string;
  componentIds?: readonly string[];
  kind?: string;
} = {}): LocalPartMedia[] {
  const allowed = options.componentIds && new Set(options.componentIds);
  return localPartMatches([...localPartMedia], query).filter((media: LocalPartMedia) =>
    (!options.category || media.category === options.category) &&
    (!allowed || allowed.has(media.componentId)) &&
    (!options.kind || media.kind === options.kind)
  );
}

export function localMediaForComponent(componentId: string) {
  return localPartMedia.filter(media => media.componentId === componentId);
}

export function mediaVehicleLabel(vehicle: {year?: string; make?: string; model?: string} = {}) {
  // Display context only. Do not attach a VIN to static image URLs or claim compatibility.
  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
}
