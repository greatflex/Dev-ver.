export type SpotCategory = 'restaurant' | 'shopping' | 'sight' | 'hotel' | 'cafe' | 'etc';
export type TransportMode = 'walk' | 'bus' | 'subway' | 'train' | 'taxi' | 'car' | 'bike' | 'flight' | 'ferry';

export interface Spot {
  id: string;
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  memo?: string;
}

/** 순서상 인접한 두 스팟 사이 이동 수단. key = `${fromId}>${toId}` */
export type LegMap = Record<string, TransportMode>;

export interface Trip {
  id: string;
  title: string;
  createdAt: number;
  spots: Spot[]; // 배열 순서 = 방문 순서
  legs: LegMap;
}
