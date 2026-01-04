import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  getMissions,
  getDrivers,
} from '../../services/api';

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
  info: '#3B82F6',
  danger: '#EF4444',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// DASHBOARD SCREEN - AUTO REFRESH ✅
// =====================================
const DashboardScreen = ({ navigation }) => {
  const [driver, setDriver] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [pendingMissions, setPendingMissions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({
    totalKilometers: 0,
    totalHoursWorked: 0,
    completedMissions: 0,
    remainingHours: 0,
    contractualHours: 40,
  });

  // 🔐 UTILISATEUR CONNECTÉ
  const { user } = useAuth();

  // =====================================
  // LOAD DATA FROM API (UTILISATEUR CONNECTÉ)
  // =====================================
  const loadDashboard = async () => {
    try {
      if (!user?.email) return;

      // 🔐 RÉCUPÉRER LE DRIVER PAR EMAIL
      const drivers = await getDrivers();
      const currentDriver = drivers.find(
        (d) => d.email === user.email
      );

      if (!currentDriver) return;

      setDriver(currentDriver);

      const missions = await getMissions();

      // 🔐 MISSIONS DU DRIVER CONNECTÉ
      const driverMissions = missions.filter(
        (m) => m.driver && m.driver.email === user.email
      );

      const active = driverMissions.find(
        (m) => m.status === 'in_progress'
      );

      const pending = driverMissions.filter(
        (m) => m.status === 'pending'
      );

      setActiveMission(active || null);
      setPendingMissions(pending);

      // 🔢 STATS SEMAINE
      const completed = driverMissions.filter(
        (m) => m.status === 'completed'
      );

      const totalKm = completed.reduce(
        (sum, m) => sum + (m.distance || 0),
        0
      );

      // ✅ Utiliser les heures du DRIVER directement
      const totalHours = parseFloat(currentDriver.hours_worked) || 0;
      const contractualHours = currentDriver.contractual_hours || 40;
      const remainingHours = Math.max(0, contractualHours - totalHours);

      console.log('📊 Stats:', {
        totalHours,
        contractualHours,
        remainingHours,
      });

      setWeeklyStats({
        totalKilometers: totalKm,
        totalHoursWorked: totalHours,
        completedMissions: completed.length,
        remainingHours: remainingHours,
        contractualHours: contractualHours,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  };

  // ✅ AUTO-REFRESH: Se déclenche à chaque fois qu'on revient sur la page
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [user?.email])
  );

  // ✅ PULL-TO-REFRESH: Permet de rafraîchir manuellement
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (!driver) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.text, padding: 24 }}>
          Chargement...
        </Text>
      </View>
    );
  }

  // ✅ Couleur dynamique pour les heures restantes
  const getRemainingHoursColor = () => {
    const percentage = (weeklyStats.remainingHours / weeklyStats.contractualHours) * 100;
    if (percentage > 50) return COLORS.success;
    if (percentage > 25) return COLORS.warning;
    return COLORS.danger;
  };

  // =====================================
  // COMPONENTS
  // =====================================
  const StatCard = ({ icon, label, value, unit, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  // =====================================
  // RENDER
  // =====================================
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{driver.name}</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons
            name="notifications-outline"
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {/* ACTIVE MISSION */}
      {activeMission && (
        <TouchableOpacity
          style={styles.activeMissionCard}
          onPress={() =>
            navigation.navigate('MissionDetails', {
              missionId: activeMission.id,
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.activeMissionHeader}>
            <View style={styles.activeMissionBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeMissionBadgeText}>
                Mission en cours
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </View>

          <Text style={styles.activeMissionRoute}>
            {activeMission.departure_city} → {activeMission.arrival_city}
          </Text>

          <View style={styles.activeMissionInfo}>
            <View style={styles.activeMissionInfoItem}>
              <Ionicons name="navigate" size={16} color={COLORS.text} />
              <Text style={styles.activeMissionInfoText}>
                {activeMission.distance} km
              </Text>
            </View>

            <View style={styles.activeMissionInfoItem}>
              <Ionicons name="cube" size={16} color={COLORS.text} />
              <Text style={styles.activeMissionInfoText}>
                {activeMission.container_type}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* WEEK STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cette semaine</Text>

        <View style={styles.statsContainer}>
          <StatCard
            icon="speedometer-outline"
            label="Kilomètres"
            value={weeklyStats.totalKilometers}
            unit="km"
            color={COLORS.primary}
          />
          <StatCard
            icon="time-outline"
            label="Heures travaillées"
            value={weeklyStats.totalHoursWorked.toFixed(1)}
            unit="h"
            color={COLORS.success}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon="checkmark-circle-outline"
            label="Missions terminées"
            value={weeklyStats.completedMissions}
            unit="missions"
            color={COLORS.info}
          />
          <StatCard
            icon="hourglass-outline"
            label="Heures restantes"
            value={weeklyStats.remainingHours.toFixed(1)}
            unit={`/ ${weeklyStats.contractualHours}h`}
            color={getRemainingHoursColor()}
          />
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <QuickActionCard
          icon="list-outline"
          title="Mes missions"
          subtitle={`${pendingMissions.length} mission${
            pendingMissions.length > 1 ? 's' : ''
          } en attente`}
          onPress={() => navigation.navigate('Missions')}
          color={COLORS.primary}
        />

        {activeMission && (
          <QuickActionCard
            icon="car-outline"
            title="Mon camion"
            subtitle="Voir les détails du camion"
            onPress={() => navigation.navigate('Truck')}
            color={COLORS.success}
          />
        )}

        <QuickActionCard
          icon="time-outline"
          title="Historique"
          subtitle="Voir toutes mes missions"
          onPress={() => navigation.navigate('History')}
          color={COLORS.info}
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
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
  greeting: { fontSize: 16, color: COLORS.textSecondary },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  notificationButton: { position: 'relative' },
  activeMissionCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  activeMissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeMissionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  activeMissionBadgeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  activeMissionRoute: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  activeMissionInfo: { flexDirection: 'row', gap: 24 },
  activeMissionInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeMissionInfoText: { color: COLORS.text, fontSize: 14, opacity: 0.9 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  statUnit: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: { flex: 1 },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: { fontSize: 14, color: COLORS.textSecondary },
});

export default DashboardScreen;