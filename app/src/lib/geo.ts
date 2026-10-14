import { Spot, TransportMode } from '../types';
import { TRANSPORTS } from './meta';

export function distanceKm(a: Spot, b: Spot): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateMinutes(km: number, mode: TransportMode): number {
  return Math.max(1, Math.round((km / TRANSPORTS[mode].speed) * 60));
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}시간${min % 60 ? ` ${min % 60}분` : ''}`;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}
