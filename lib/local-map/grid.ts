import { GRID_SIZE, ZOOM_BY_RADIUS } from './rules';
import type { GridPoint } from './types';

const MILES_PER_DEGREE_LAT = 69.0;

/** The 25 points, north row first and west column first (the order the report draws them), spread evenly over the square
    that runs `radiusMiles` from the centre in each direction. */
export function makeGrid(lat: number, lng: number, radiusMiles: number): GridPoint[] {
  const half = (GRID_SIZE - 1) / 2;
  const stepMiles = radiusMiles / half;
  const dLat = stepMiles / MILES_PER_DEGREE_LAT;
  const dLng = stepMiles / (MILES_PER_DEGREE_LAT * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const points: GridPoint[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      points.push({
        i: row * GRID_SIZE + col,
        row,
        col,
        lat: round6(lat + (half - row) * dLat),
        lng: round6(lng + (col - half) * dLng),
      });
    }
  }
  return points;
}

export const coordinateFor = (p: GridPoint, radiusMiles: number) => `${p.lat},${p.lng},${ZOOM_BY_RADIUS[radiusMiles] ?? '14z'}`;

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
