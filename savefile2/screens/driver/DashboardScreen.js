import { Ionicons } from '@expo/vector-icons';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    getActiveMission,
    getPendingMissions,
    mockDriver,
    mockWeeklyStats,
} from '../../data/mockData';

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
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// DASHBOARD SCREEN
// =====================================
const DashboardScreen = ({ navigation }) => {
  const activeMission = getActiveMission(mockDriver.id);
  const pendingMissions = getPendingMissions(mockDriver.id);

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
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: color + '20' },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{mockDriver.name}</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>

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
              mission: activeMission,
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

            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.text}
            />
          </View>

          <Text style={styles.activeMissionRoute}>
            {activeMission.departureCity} → {activeMission.arrivalCity}
          </Text>

          <View style={styles.activeMissionInfo}>
            <View style={styles.activeMissionInfoItem}>
              <Ionicons
                name="navigate"
                size={16}
                color={COLORS.text}
              />
              <Text style={styles.activeMissionInfoText}>
                {activeMission.distance} km
              </Text>
            </View>

            <View style={styles.activeMissionInfoItem}>
              <Ionicons
                name="cube"
                size={16}
                color={COLORS.text}
              />
              <Text style={styles.activeMissionInfoText}>
                {activeMission.containerType}
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
            value={mockWeeklyStats.totalKilometers}
            unit="km"
            color={COLORS.primary}
          />
          <StatCard
            icon="time-outline"
            label="Heures travaillées"
            value={mockWeeklyStats.totalHoursWorked.toFixed(1)}
            unit="h"
            color={COLORS.success}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon="checkmark-circle-outline"
            label="Missions terminées"
            value={mockWeeklyStats.completedMissions}
            unit="missions"
            color={COLORS.info}
          />
          <StatCard
            icon="trending-up-outline"
            label="Vitesse moyenne"
            value={mockWeeklyStats.averageSpeed}
            unit="km/h"
            color={COLORS.warning}
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
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
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
  activeMissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
  activeMissionInfo: {
    flexDirection: 'row',
    gap: 24,
  },
  activeMissionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeMissionInfoText: {
    color: COLORS.text,
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
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
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  statUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
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
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default DashboardScreen;
