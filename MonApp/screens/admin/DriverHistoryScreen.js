import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMissions } from '../../services/api';
import MissionCard from '../../components/MissionCard';

const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#3B82F6',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
};

const DriverHistoryScreen = ({ route, navigation }) => {
  const { driverId, driverName } = route.params;
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const all = await getMissions();
      const completed = all.filter(m => m.driver?.id === driverId && m.status === 'completed');
      setMissions(completed);
    };
    load();
  }, [driverId]);

  const applyFilter = () => {
    const now = new Date();
    if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      return missions.filter(m => new Date(m.actual_end_time) >= startOfWeek);
    }
    if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return missions.filter(m => new Date(m.actual_end_time) >= startOfMonth);
    }
    return missions;
  };

  const filtered = applyFilter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Historique - {driverName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filters}>
        {['all', 'week', 'month'].map(f => (
          <TouchableOpacity key={f} style={[styles.filter, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Toutes' : f === 'week' ? '7 jours' : 'Ce mois'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {filtered.map(m => (
          <MissionCard key={m.id} mission={m} showStatus onPress={() => navigation.navigate('MissionDetail', { missionId: m.id })} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  filters: { flexDirection: 'row', padding: 24, gap: 12 },
  filter: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.card, borderRadius: 999 },
  filterActive: { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted },
  filterTextActive: { color: COLORS.primary, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
});

export default DriverHistoryScreen;