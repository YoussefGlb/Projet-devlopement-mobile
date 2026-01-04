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

import { getMissions } from '../../services/api';

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
// TRUCK SCREEN - FIXED ✅
// =====================================
const TruckScreen = ({ navigation, route }) => {
  const [activeMission, setActiveMission] = useState(null);
  const [truck, setTruck] = useState(null);

  // 🔑 RÉCUPÉRER LE DRIVER ID DEPUIS LES PARAMS DE NAVIGATION
  // (Même pattern que MissionDetailsScreen)
  const currentDriverId = route?.params?.driverId;

  // =====================================
  // LOAD TRUCK FROM DRIVER'S ACTIVE MISSION
  // =====================================
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadTruck = async () => {
        try {
          console.log('🔍 Loading truck for driver:', currentDriverId);

          // 📡 RÉCUPÉRER TOUTES LES MISSIONS
          const missions = await getMissions();
          console.log('📦 Total missions:', missions.length);

          if (!isActive) return;

          // ✅ SI PAS DE DRIVER ID, CHERCHER N'IMPORTE QUELLE MISSION EN COURS
          // (Pour le mode démo/test)
          let myMissionInProgress;
          
          if (currentDriverId) {
            // Mode authentifié: chercher les missions de CE chauffeur
            myMissionInProgress = missions.find(
              (m) => {
                const isInProgress = m.status === 'in_progress';
                const isMyMission = m.driver?.id === currentDriverId;
                console.log(`Mission ${m.id}: status=${m.status}, driver=${m.driver?.id}, match=${isInProgress && isMyMission}`);
                return isInProgress && isMyMission;
              }
            );
          } else {
            // Mode démo: chercher N'IMPORTE QUELLE mission en cours
            myMissionInProgress = missions.find(
              (m) => m.status === 'in_progress'
            );
            console.log('⚠️ Mode démo: aucun driver ID fourni');
          }

          // 🚫 AUCUNE MISSION EN COURS
          if (!myMissionInProgress) {
            console.log('❌ Aucune mission en cours trouvée');
            setActiveMission(null);
            setTruck(null);
            return;
          }

          // 🚫 PAS DE CAMION ASSIGNÉ
          if (!myMissionInProgress.truck) {
            console.log('⚠️ Mission trouvée mais pas de camion assigné');
            setActiveMission(null);
            setTruck(null);
            return;
          }

          // ✅ MISSION TROUVÉE AVEC CAMION
          console.log(`✅ Mission ${myMissionInProgress.id} trouvée avec camion ${myMissionInProgress.truck.plate}`);
          setActiveMission(myMissionInProgress);
          setTruck(myMissionInProgress.truck);
          
        } catch (e) {
          console.error('❌ TruckScreen load error:', e);
          if (isActive) {
            setActiveMission(null);
            setTruck(null);
          }
        }
      };

      loadTruck();

      return () => {
        isActive = false;
      };
    }, [currentDriverId])
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

  const fuelPercentage = truck.fuel_percentage ?? 0;

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
          <Text style={styles.truckId}>ID camion : {truck.id}</Text>
        </View>

        {/* FUEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de carburant</Text>

          <View style={styles.card}>
            <Text style={styles.fuelPercent}>{fuelPercentage}%</Text>
            <Text style={styles.fuelText}>
              {truck.current_fuel}L / {truck.tank_capacity}L
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
              value={`${truck.tank_capacity} L`}
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
                hasActiveMission: true,
              })
            }
          >
            <Text style={styles.missionRoute}>
              {activeMission.departure_city} → {activeMission.arrival_city}
            </Text>
            <Text style={styles.missionMeta}>
              {activeMission.distance} km • {activeMission.container_type}
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
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  card: { backgroundColor: COLORS.card, padding: 16, borderRadius: 12 },
  fuelPercent: { color: COLORS.text, fontSize: 28, fontWeight: '700' },
  fuelText: { color: COLORS.textSecondary, marginBottom: 12 },
  fuelBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fuelFill: { height: '100%' },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  warningText: { color: COLORS.warning, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginVertical: 12 },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: COLORS.text, fontWeight: '700' },
});

export default TruckScreen;