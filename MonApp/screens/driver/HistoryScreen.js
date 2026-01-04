import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import MissionCard from '../../components/MissionCard';
import { getMissions, getDrivers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// =====================================
// COULEURS LOCALES (SAFE)
// =====================================
const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// HISTORY SCREEN - FIXED ✅
// =====================================
const HistoryScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 UTILISATEUR CONNECTÉ
  const { user } = useAuth();

  // =====================================
  // LOAD DATA FROM API - AUTO REFRESH ✅
  // =====================================
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadHistory = async () => {
        try {
          setLoading(true);
          console.log('🔄 HistoryScreen: Refreshing data for user:', user?.email);

          if (!user?.email) {
            console.log('⚠️ Aucun utilisateur connecté');
            if (isActive) {
              setCompletedMissions([]);
              setLoading(false);
            }
            return;
          }

          const drivers = await getDrivers();
          const currentDriver = drivers.find((d) => d.email === user.email);

          if (!currentDriver) {
            console.log('❌ Driver non trouvé');
            if (isActive) {
              setCompletedMissions([]);
              setLoading(false);
            }
            return;
          }

          console.log('✅ Driver trouvé:', currentDriver.name);

          const missions = await getMissions();

          // 🔐 MISSIONS TERMINÉES DU DRIVER CONNECTÉ
          const completed = missions.filter(
            (m) =>
              m.driver &&
              m.driver.email === user.email &&
              m.status === 'completed'
          );

          console.log(`📦 ${completed.length} missions terminées trouvées`);

          if (isActive) {
            setCompletedMissions(completed);
            setLoading(false);
          }
        } catch (err) {
          console.error('❌ History error:', err);
          if (isActive) {
            setCompletedMissions([]);
            setLoading(false);
          }
        }
      };

      loadHistory();

      return () => {
        isActive = false;
      };
    }, [user?.email])
  );

  // =====================================
  // FILTERS - FIXED ✅
  // =====================================
  const applyFilter = () => {
    const now = new Date();

    if (filter === 'week') {
      // 📅 DERNIERS 7 JOURS
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);

      return completedMissions.filter((m) => {
        if (!m.actual_end_time) return false;
        const endDate = new Date(m.actual_end_time);
        return endDate >= startOfWeek;
      });
    }

    if (filter === 'month') {
      // 📅 CE MOIS-CI
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      return completedMissions.filter((m) => {
        if (!m.actual_end_time) return false;
        const endDate = new Date(m.actual_end_time);
        return endDate >= startOfMonth;
      });
    }

    // 📅 TOUTES LES MISSIONS
    return completedMissions;
  };

  const filteredMissions = applyFilter();

  // =====================================
  // STATS - SANS LES HEURES ✅
  // =====================================
  const calculateTotals = () => {
    const totalKm = filteredMissions.reduce(
      (sum, m) => sum + (m.distance || 0),
      0
    );
    const totalCost = filteredMissions.reduce(
      (sum, m) => sum + (Number(m.actual_fuel_cost) || Number(m.estimated_fuel_cost) || 0),
      0
    );

    return { totalKm, totalCost };
  };

  const totals = calculateTotals();

  // =====================================
  // COMPONENTS
  // =====================================
  const FilterChip = ({ label, value, icon }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filter === value && styles.filterChipActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Ionicons
        name={icon}
        size={16}
        color={filter === value ? COLORS.primary : COLORS.textMuted}
      />
      <Text
        style={[
          styles.filterChipText,
          filter === value && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatBox = ({ icon, label, value, color }) => (
    <View style={styles.statBox}>
      <View
        style={[
          styles.statIconContainer,
          { backgroundColor: color + '20' },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // =====================================
  // RENDER
  // =====================================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{filteredMissions.length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* GLOBAL STATS - SANS LES HEURES ✅ */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatBox
              icon="navigate-outline"
              label="Total km"
              value={totals.totalKm}
              color={COLORS.primary}
            />
            <StatBox
              icon="cash-outline"
              label="Coût carburant"
              value={`${totals.totalCost.toFixed(0)} DH`}
              color={COLORS.warning}
            />
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterChip label="Toutes" value="all" icon="list-outline" />
            <FilterChip
              label="7 derniers jours"
              value="week"
              icon="calendar-outline"
            />
            <FilterChip
              label="Ce mois"
              value="month"
              icon="calendar-outline"
            />
          </ScrollView>
        </View>

        {/* MISSIONS LIST */}
        <View style={styles.missionsSection}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : filteredMissions.length > 0 ? (
            filteredMissions
              .sort((a, b) => {
                // Trier par date de fin (plus récent en premier)
                const dateA = new Date(a.actual_end_time || 0);
                const dateB = new Date(b.actual_end_time || 0);
                return dateB - dateA;
              })
              .map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  showStatus
                  onPress={() =>
                    navigation.navigate('MissionDetails', {
                      missionId: mission.id,
                    })
                  }
                />
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={80}
                  color={COLORS.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'all'
                  ? 'Aucune mission terminée'
                  : filter === 'week'
                  ? 'Aucune mission cette semaine'
                  : 'Aucune mission ce mois-ci'}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? 'Vos missions terminées apparaîtront ici'
                  : 'Modifiez le filtre pour voir plus de missions'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  statsSection: { paddingHorizontal: 24, marginBottom: 16 },
  statsGrid: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  filterSection: { marginBottom: 16 },
  filterContainer: { paddingHorizontal: 24, gap: 12 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  missionsSection: { paddingHorizontal: 24 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: { marginBottom: 24, opacity: 0.5 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default HistoryScreen;