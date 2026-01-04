import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import MissionCard from '../../components/MissionCard';
import { getCompletedMissions, mockDriver } from '../../data/mockData';

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
// HISTORY SCREEN
// =====================================
const HistoryScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const completedMissions = getCompletedMissions(mockDriver.id);

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

  const calculateTotals = () => {
    const totalKm = completedMissions.reduce(
      (sum, m) => sum + m.distance,
      0
    );
    const totalHours = completedMissions.reduce(
      (sum, m) => sum + (m.hoursWorked || 0),
      0
    );
    const totalCost = completedMissions.reduce(
      (sum, m) => sum + (m.actualFuelCost || 0),
      0
    );
    return { totalKm, totalHours, totalCost };
  };

  const totals = calculateTotals();

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

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {completedMissions.length}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* GLOBAL STATS */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatBox
              icon="navigate-outline"
              label="Total km"
              value={totals.totalKm}
              color={COLORS.primary}
            />
            <StatBox
              icon="time-outline"
              label="Total heures"
              value={totals.totalHours.toFixed(1)}
              color={COLORS.success}
            />
            <StatBox
              icon="cash-outline"
              label="Coût carburant"
              value={`${totals.totalCost} DH`}
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
              label="Cette semaine"
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
          {completedMissions.length > 0 ? (
            completedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onPress={() =>
                  navigation.navigate('MissionDetails', { mission })
                }
                showStatus
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
                Aucune mission terminée
              </Text>
              <Text style={styles.emptyText}>
                Vos missions terminées apparaîtront ici
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  badgeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statsGrid: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
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
  filterSection: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
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
  missionsSection: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
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
