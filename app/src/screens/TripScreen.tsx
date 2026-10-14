import React, { useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Polyline, LongPressEvent } from 'react-native-maps';
import { legKey, useStore } from '../store';
import { Spot, SpotCategory, TransportMode } from '../types';
import { CATEGORIES, TRANSPORTS } from '../lib/meta';
import { distanceKm, estimateMinutes, formatDistance, formatDuration } from '../lib/geo';

const DEFAULT_MODE: TransportMode = 'walk';

export default function TripScreen({ tripId, onBack }: { tripId: string; onBack: () => void }) {
  const trip = useStore((s) => s.trips.find((t) => t.id === tripId));
  const { addSpot, updateSpot, removeSpot, moveSpot, setLeg } = useStore();
  const mapRef = useRef<MapView>(null);
  const [draft, setDraft] = useState<{ id?: string; lat: number; lng: number; name: string; category: SpotCategory } | null>(null);

  const legs = useMemo(() => {
    if (!trip) return [];
    return trip.spots.slice(1).map((to, i) => {
      const from = trip.spots[i];
      const mode = trip.legs[legKey(from.id, to.id)] ?? DEFAULT_MODE;
      const km = distanceKm(from, to);
      return { from, to, mode, km, min: estimateMinutes(km, mode) };
    });
  }, [trip]);

  if (!trip) return null;

  const onLongPress = (e: LongPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDraft({ lat: latitude, lng: longitude, name: '', category: 'sight' });
  };

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const { id, name, ...rest } = draft;
    if (id) updateSpot(tripId, { id, name: name.trim(), ...rest });
    else addSpot(tripId, { name: name.trim(), ...rest });
    setDraft(null);
  };

  const focus = (s: Spot) =>
    mapRef.current?.animateToRegion({ latitude: s.lat, longitude: s.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });

  const totalMin = legs.reduce((a, l) => a + l.min, 0);

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        onLongPress={onLongPress}
        initialRegion={{ latitude: 37.5665, longitude: 126.978, latitudeDelta: 0.2, longitudeDelta: 0.2 }}>
        {trip.spots.map((sp, i) => (
          <Marker key={sp.id} coordinate={{ latitude: sp.lat, longitude: sp.lng }} title={`${i + 1}. ${sp.name}`} pinColor={CATEGORIES[sp.category].color} />
        ))}
        {legs.map((l) => (
          <Polyline
            key={legKey(l.from.id, l.to.id)}
            coordinates={[
              { latitude: l.from.lat, longitude: l.from.lng },
              { latitude: l.to.lat, longitude: l.to.lng },
            ]}
            strokeColor={TRANSPORTS[l.mode].color}
            strokeWidth={5}
            lineDashPattern={l.mode === 'walk' ? [8, 8] : undefined}
          />
        ))}
      </MapView>

      <View style={s.header}>
        <Pressable onPress={onBack}><Text style={s.back}>‹ 목록</Text></Pressable>
        <Text style={s.title} numberOfLines={1}>{trip.title}</Text>
        <Text style={s.total}>{legs.length ? `총 ${formatDuration(totalMin)}` : ''}</Text>
      </View>

      <View style={s.sheet}>
        <Text style={s.hint}>지도를 길게 눌러 스팟을 추가하세요</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {trip.spots.map((sp, i) => {
            const leg = i > 0 ? legs[i - 1] : null;
            return (
              <View key={sp.id}>
                {leg && (
                  <View style={s.leg}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {(Object.keys(TRANSPORTS) as TransportMode[]).map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => setLeg(tripId, leg.from.id, leg.to.id, m)}
                          style={[s.chip, leg.mode === m && { backgroundColor: TRANSPORTS[m].color }]}>
                          <Text style={[s.chipText, leg.mode === m && { color: '#fff' }]}>{TRANSPORTS[m].icon} {TRANSPORTS[m].label}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    <Text style={s.legInfo}>{TRANSPORTS[leg.mode].icon} {formatDistance(leg.km)} · 약 {formatDuration(leg.min)}</Text>
                  </View>
                )}
                <Pressable
                  style={s.spot}
                  onPress={() => focus(sp)}
                  onLongPress={() =>
                    Alert.alert(sp.name, undefined, [
                      { text: '수정', onPress: () => setDraft({ ...sp }) },
                      { text: '삭제', style: 'destructive', onPress: () => removeSpot(tripId, sp.id) },
                      { text: '취소', style: 'cancel' },
                    ])
                  }>
                  <View style={[s.num, { backgroundColor: CATEGORIES[sp.category].color }]}><Text style={s.numText}>{i + 1}</Text></View>
                  <Text style={s.spotName}>{CATEGORIES[sp.category].icon} {sp.name}</Text>
                  <Pressable onPress={() => moveSpot(tripId, i, i - 1)} hitSlop={8}><Text style={s.arrow}>↑</Text></Pressable>
                  <Pressable onPress={() => moveSpot(tripId, i, i + 1)} hitSlop={8}><Text style={s.arrow}>↓</Text></Pressable>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={!!draft} transparent animationType="slide" onRequestClose={() => setDraft(null)}>
        <View style={s.modalBg}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{draft?.id ? '스팟 수정' : '스팟 추가'}</Text>
            <TextInput style={s.input} placeholder="장소 이름" value={draft?.name} onChangeText={(name) => setDraft((d) => d && { ...d, name })} autoFocus />
            <View style={s.catRow}>
              {(Object.keys(CATEGORIES) as SpotCategory[]).map((c) => (
                <Pressable key={c} onPress={() => setDraft((d) => d && { ...d, category: c })} style={[s.chip, draft?.category === c && { backgroundColor: CATEGORIES[c].color }]}>
                  <Text style={[s.chipText, draft?.category === c && { color: '#fff' }]}>{CATEGORIES[c].icon} {CATEGORIES[c].label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.btnRow}>
              <Pressable style={[s.btn, { backgroundColor: '#e5e7eb' }]} onPress={() => setDraft(null)}><Text>취소</Text></Pressable>
              <Pressable style={[s.btn, { backgroundColor: '#2563eb' }]} onPress={save}><Text style={{ color: '#fff', fontWeight: '700' }}>저장</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, paddingBottom: 10, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.92)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  title: { flex: 1, fontSize: 17, fontWeight: '700' },
  total: { color: '#6b7280' },
  sheet: { height: '45%', backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 14, paddingTop: 10 },
  hint: { color: '#9ca3af', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  spot: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  spotName: { flex: 1, fontSize: 16, fontWeight: '600' },
  arrow: { fontSize: 18, color: '#6b7280', paddingHorizontal: 6 },
  leg: { marginLeft: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#d1d5db', paddingVertical: 6 },
  legInfo: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#f3f4f6', marginRight: 6, marginBottom: 6 },
  chipText: { fontSize: 13 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modal: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
