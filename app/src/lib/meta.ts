import { SpotCategory, TransportMode } from '../types';

export const CATEGORIES: Record<SpotCategory, { label: string; icon: string; color: string }> = {
  restaurant: { label: '식당', icon: '🍽️', color: '#ef4444' },
  cafe: { label: '카페', icon: '☕', color: '#a16207' },
  shopping: { label: '쇼핑', icon: '🛍️', color: '#ec4899' },
  sight: { label: '관광', icon: '📍', color: '#3b82f6' },
  hotel: { label: '호텔', icon: '🏨', color: '#8b5cf6' },
  etc: { label: '기타', icon: '⭐', color: '#6b7280' },
};

// speed: km/h (직선거리 기반 대략 추정)
export const TRANSPORTS: Record<TransportMode, { label: string; icon: string; color: string; speed: number }> = {
  walk: { label: '도보', icon: '🚶', color: '#22c55e', speed: 4.5 },
  bike: { label: '자전거', icon: '🚲', color: '#14b8a6', speed: 14 },
  bus: { label: '버스', icon: '🚌', color: '#3b82f6', speed: 20 },
  subway: { label: '지하철', icon: '🚇', color: '#6366f1', speed: 30 },
  train: { label: '기차', icon: '🚆', color: '#0ea5e9', speed: 90 },
  taxi: { label: '택시', icon: '🚕', color: '#eab308', speed: 30 },
  car: { label: '자동차', icon: '🚗', color: '#f97316', speed: 40 },
  ferry: { label: '배', icon: '⛴️', color: '#06b6d4', speed: 25 },
  flight: { label: '비행기', icon: '✈️', color: '#ec4899', speed: 700 },
};
