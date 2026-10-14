import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from '../store';

export default function TripListScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const { trips, createTrip, deleteTrip } = useStore();
  const [title, setTitle] = useState('');

  const add = () => {
    const t = title.trim();
    if (!t) return;
    setTitle('');
    onOpen(createTrip(t));
  };

  return (
    <View style={s.container}>
      <Text style={s.h1}>내 여정</Text>
      <View style={s.row}>
        <TextInput style={s.input} placeholder="새 여정 이름 (예: 도쿄 3박4일)" value={title} onChangeText={setTitle} onSubmitEditing={add} />
        <Pressable style={s.btn} onPress={add}><Text style={s.btnText}>만들기</Text></Pressable>
      </View>
      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={s.empty}>아직 여정이 없어요. 위에서 만들어보세요.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={s.card}
            onPress={() => onOpen(item.id)}
            onLongPress={() =>
              Alert.alert('여정 삭제', `"${item.title}"을(를) 삭제할까요?`, [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => deleteTrip(item.id) },
              ])
            }>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Text style={s.sub}>스팟 {item.spots.length}곳</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: 64, paddingHorizontal: 16, backgroundColor: '#fff' },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  btn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  card: { padding: 16, borderRadius: 12, backgroundColor: '#f3f4f6', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  sub: { color: '#6b7280', marginTop: 4 },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
});
