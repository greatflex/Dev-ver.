import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import TripListScreen from './src/screens/TripListScreen';
import TripScreen from './src/screens/TripScreen';

export default function App() {
  const [tripId, setTripId] = useState<string | null>(null);
  return (
    <>
      <StatusBar style="auto" />
      {tripId ? <TripScreen tripId={tripId} onBack={() => setTripId(null)} /> : <TripListScreen onOpen={setTripId} />}
    </>
  );
}
