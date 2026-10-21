/* Shared by the map and its legend. Kept out of MapCanvas.tsx so importing it never pulls Leaflet (which needs a
   browser) into the server render. */

export type MapPoint = {
  name: string;
  lat: number;
  lng: number;
  score: number;
  kind: 'practice' | 'chain' | 'medical' | 'nonprofit';
  detail: string;
  href: string | null;
};

export const KIND_COLOUR: Record<MapPoint['kind'], string> = {
  practice: '#146ef5',
  chain: '#b8860b',
  medical: '#e8553b',
  nonprofit: '#0a9a86',
};
