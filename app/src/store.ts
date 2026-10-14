import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot, Trip, TransportMode } from './types';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const legKey = (a: string, b: string) => `${a}>${b}`;

interface State {
  trips: Trip[];
  createTrip: (title: string) => string;
  deleteTrip: (id: string) => void;
  addSpot: (tripId: string, spot: Omit<Spot, 'id'>) => void;
  updateSpot: (tripId: string, spot: Spot) => void;
  removeSpot: (tripId: string, spotId: string) => void;
  moveSpot: (tripId: string, from: number, to: number) => void;
  setLeg: (tripId: string, fromId: string, toId: string, mode: TransportMode) => void;
}

const patch = (trips: Trip[], id: string, fn: (t: Trip) => Trip) =>
  trips.map((t) => (t.id === id ? fn(t) : t));

export const useStore = create<State>()(
  persist(
    (set) => ({
      trips: [],
      createTrip: (title) => {
        const id = uid();
        set((s) => ({
          trips: [{ id, title, createdAt: Date.now(), spots: [], legs: {} }, ...s.trips],
        }));
        return id;
      },
      deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      addSpot: (tripId, spot) =>
        set((s) => ({
          trips: patch(s.trips, tripId, (t) => ({ ...t, spots: [...t.spots, { ...spot, id: uid() }] })),
        })),
      updateSpot: (tripId, spot) =>
        set((s) => ({
          trips: patch(s.trips, tripId, (t) => ({
            ...t,
            spots: t.spots.map((p) => (p.id === spot.id ? spot : p)),
          })),
        })),
      removeSpot: (tripId, spotId) =>
        set((s) => ({
          trips: patch(s.trips, tripId, (t) => ({ ...t, spots: t.spots.filter((p) => p.id !== spotId) })),
        })),
      moveSpot: (tripId, from, to) =>
        set((s) => ({
          trips: patch(s.trips, tripId, (t) => {
            if (to < 0 || to >= t.spots.length) return t;
            const spots = [...t.spots];
            const [m] = spots.splice(from, 1);
            spots.splice(to, 0, m);
            return { ...t, spots };
          }),
        })),
      setLeg: (tripId, fromId, toId, mode) =>
        set((s) => ({
          trips: patch(s.trips, tripId, (t) => ({ ...t, legs: { ...t.legs, [legKey(fromId, toId)]: mode } })),
        })),
    }),
    { name: 'trips-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
