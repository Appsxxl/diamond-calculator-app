import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';

interface InfoTipProps {
  title: string;
  body: string | string[];
}

export function InfoTip({ title, body }: InfoTipProps) {
  const [visible, setVisible] = useState(false);
  const paragraphs = Array.isArray(body) ? body : [body];
  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
        <View style={S.btn}>
          <Text style={S.btnText}>ⓘ</Text>
        </View>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={S.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={S.card} onStartShouldSetResponder={() => true}>
            <View style={S.header}>
              <Text style={S.title}>{title}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={S.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {paragraphs.map((p, i) => (
                <Text key={i} style={[S.body, i > 0 && { marginTop: 12 }]}>{p}</Text>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const S = StyleSheet.create({
  btn: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', lineHeight: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#0f172a', borderRadius: 16, padding: 20, width: '100%', ...Platform.select({ web: { maxWidth: 480 } as any }), borderWidth: 1, borderColor: '#1e293b', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: '#f59e0b', fontSize: 15, fontWeight: '800', flex: 1, marginRight: 12, letterSpacing: 0.3 },
  close: { color: '#475569', fontSize: 20, lineHeight: 22 },
  body: { color: '#cbd5e1', fontSize: 13, lineHeight: 21 },
});
