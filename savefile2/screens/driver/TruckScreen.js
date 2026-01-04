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
    getTruckById,
    mockDriver,
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
  error: '#EF4444',
  info: '#0EA5E9',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// TRUCK SCREEN
// =====================================
const TruckScreen = ({ navigation }) => {
  const activeMission = getActiveMission(mockDriver.id);
  const truck = activeMission
    ? getTruckById(activeMission.truckId)
    : null;

  const fuelPercentage = truck?.fuelPercentage ?? 0;

  const getFuelColor = () => {
    if (fuelPercentage > 50) return COLORS.success;
    if (fuelPercentage > 25) return COLORS.warning;
    return COLORS.error;
  };

  const DetailCard = ({ icon, label, value, color }) => (
    <View style={styles.detailCard}>
      <View style={[styles.detailIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  // =====================
  // NO ACTIVE TRUCK
  // =====================
  if (!activeMission || !truck) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Camion</Text>
        </View>

        <View style={styles.empty}>
          <Ionicons
            name="car-sport-outline"
            size={100}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyTitle}>Aucun camion assigné</Text>
          <Text style={styles.emptyText}>
            Vous devez avoir une mission en cours pour voir les détails du camion.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Missions')}
          >
            <Text style={styles.emptyButtonText}>Voir mes missions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Camion</Text>

          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>En mission</Text>
          </View>
        </View>

        {/* ICON */}
        <View style={styles.truckIcon}>
          <Ionicons name="car-sport" size={120} color={COLORS.primary} />
        </View>

        {/* MAIN INFO */}
        <View style={styles.mainCard}>
          <Text style={styles.truckBrand}>{truck.brand}</Text>
          <Text style={styles.truckPlate}>{truck.plate}</Text>
          <Text style={styles.truckId}>{truck.id}</Text>
        </View>

        {/* FUEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de carburant</Text>

          <View style={styles.card}>
            <Text style={styles.fuelPercent}>{fuelPercentage}%</Text>
            <Text style={styles.fuelText}>
              {truck.currentFuel}L / {truck.tankCapacity}L
            </Text>

            <View style={styles.fuelBar}>
              <View
                style={[
                  styles.fuelFill,
                  {
                    width: `${fuelPercentage}%`,
                    backgroundColor: getFuelColor(),
                  },
                ]}
              />
            </View>

            {fuelPercentage < 30 && (
              <View style={styles.warning}>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={COLORS.warning}
                />
                <Text style={styles.warningText}>
                  Niveau de carburant bas
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>

          <View style={styles.grid}>
            <DetailCard
              icon="speedometer-outline"
              label="Puissance"
              value={`${truck.power} CV`}
              color={COLORS.primary}
            />
            <DetailCard
              icon="cube-outline"
              label="Capacité"
              value={`${truck.capacity / 1000} T`}
              color={COLORS.success}
            />
            <DetailCard
              icon="flash-outline"
              label="Motorisation"
              value={truck.motorization}
              color={COLORS.warning}
            />
            <DetailCard
              icon="water-outline"
              label="Réservoir"
              value={`${truck.tankCapacity} L`}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* MISSION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission en cours</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('MissionDetails', {
                mission: activeMission,
              })
            }
          >
            <Text style={styles.missionRoute}>
              {activeMission.departureCity} → {activeMission.arrivalCity}
            </Text>
            <Text style={styles.missionMeta}>
              {activeMission.distance} km • {activeMission.containerType}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700' },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: { color: COLORS.success, fontWeight: '600' },

  truckIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },

  mainCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  truckBrand: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  truckPlate: { color: COLORS.primary, fontSize: 16, marginTop: 4 },
  truckId: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
  },

  fuelPercent: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  fuelText: { color: COLORS.textSecondary, marginBottom: 12 },

  fuelBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fuelFill: { height: '100%' },

  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  warningText: { color: COLORS.warning, fontSize: 12 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  detailCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: { color: COLORS.textMuted, fontSize: 12 },
  detailValue: { color: COLORS.text, fontWeight: '600' },

  missionRoute: { color: COLORS.text, fontWeight: '700' },
  missionMeta: { color: COLORS.textSecondary, marginTop: 4 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: COLORS.text, fontWeight: '700' },
});

export default TruckScreen;
