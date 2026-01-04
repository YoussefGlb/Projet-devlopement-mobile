import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTime } from '../data/mockData';

// =====================================
// PALETTE SIMPLE (LOCALE AU FICHIER)
// =====================================
const COLORS = {
  bg: '#0F172A',
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
// MISSION CARD
// =====================================
const MissionCard = ({ mission, onPress, showStatus = true }) => {
  // =====================================================
  // 🔥 ADAPTATION API DJANGO → FRONT (CRUCIAL)
  // =====================================================
  const pickupTime = mission.pickup_time ?? mission.pickupTime;
  const expectedDropoffTime =
    mission.expected_dropoff_time ?? mission.expectedDropoffTime;

  const containerType = mission.container_type ?? mission.containerType;

  const estimatedFuelCost =
    mission.estimated_fuel_cost ?? mission.estimatedFuelCost;
  const actualFuelCost =
    mission.actual_fuel_cost ?? mission.actualFuelCost;

  const hoursWorked = mission.hours_worked ?? mission.hoursWorked;
  // =====================================================

  const getStatusInfo = (status) => {
    switch (status) {
      case 'in_progress':
        return { label: 'En cours', color: COLORS.success, icon: 'play-circle' };
      case 'pending':
        return { label: 'En attente', color: COLORS.warning, icon: 'time' };
      case 'completed':
        return { label: 'Terminée', color: COLORS.info, icon: 'checkmark-circle' };
      default:
        return { label: 'Inconnu', color: COLORS.textMuted, icon: 'help-circle' };
    }
  };

  const statusInfo = getStatusInfo(mission.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
          </View>

          <View>
            <Text style={styles.missionId}>{mission.id}</Text>
            <Text style={styles.containerInfo}>{containerType}</Text>
          </View>
        </View>

        {showStatus && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <Ionicons
              name={statusInfo.icon}
              size={14}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        )}
      </View>

      {/* ROUTE */}
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.dotDeparture} />
          <View style={styles.routeLine} />
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.cityRow}>
            <Text style={styles.cityLabel}>Départ</Text>
            <Text style={styles.cityName}>{mission.departure_city ?? mission.departureCity}</Text>
            <Text style={styles.timeText}>{formatTime(pickupTime)}</Text>
          </View>

          <View style={styles.cityRow}>
            <Text style={styles.cityLabel}>Arrivée</Text>
            <Text style={styles.cityName}>{mission.arrival_city ?? mission.arrivalCity}</Text>
            <Text style={styles.timeText}>
              {formatTime(expectedDropoffTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{mission.distance} km</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {(estimatedFuelCost ?? actualFuelCost) + ' DH'}
          </Text>
        </View>

        {hoursWorked != null && (
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {Number(hoursWorked).toFixed(1)}h
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  containerInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    marginRight: 16,
  },
  dotDeparture: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  cityRow: {
    marginBottom: 12,
  },
  cityLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default MissionCard;
