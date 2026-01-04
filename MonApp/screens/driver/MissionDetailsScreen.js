import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';

import {
  getMissionById,
  startMission,
  completeMission,
} from '../../services/api';

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
// UTILS
// =====================================
const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// =====================================
// 🗺️ NAVIGATION FUNCTIONS
// =====================================
const openGoogleMaps = (departureLat, departureLng, arrivalLat, arrivalLng) => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${departureLat},${departureLng}&destination=${arrivalLat},${arrivalLng}&travelmode=driving`;
  
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps');
    }
  });
};

const openWaze = (arrivalLat, arrivalLng) => {
  const url = `https://waze.com/ul?ll=${arrivalLat},${arrivalLng}&navigate=yes`;
  
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Waze n\'est pas installé sur cet appareil');
    }
  });
};

const openAppleMaps = (departureLat, departureLng, arrivalLat, arrivalLng) => {
  const url = `http://maps.apple.com/?saddr=${departureLat},${departureLng}&daddr=${arrivalLat},${arrivalLng}&dirflg=d`;
  
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Impossible d\'ouvrir Apple Maps');
    }
  });
};

// =====================================
// MISSION DETAILS SCREEN
// =====================================
const MissionDetailsScreen = ({ route, navigation }) => {
  const missionFromParams = route?.params?.mission || null;
  const missionIdFromParams = route?.params?.missionId || null;
  const hasActiveMission = route?.params?.hasActiveMission === true;

  if (!missionFromParams && !missionIdFromParams) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.text }}>Mission introuvable</Text>
      </View>
    );
  }

  const [currentMission, setCurrentMission] = useState(missionFromParams);
  const [truck, setTruck] = useState(missionFromParams?.truck || null);

  // =====================================
  // LOAD DATA FROM API
  // =====================================
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const id = missionFromParams?.id || missionIdFromParams;
        const res = await getMissionById(id);

        if (isMounted && res?.id) {
          setCurrentMission(res);
          setTruck(res.truck || null);
        }
      } catch (e) {
        console.error('MissionDetails load error:', e);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [missionFromParams?.id, missionIdFromParams]);

  if (!currentMission) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.text }}>Chargement de la mission…</Text>
      </View>
    );
  }

  // =====================================
  // NAVIGATION CHOOSER
  // =====================================
  const handleOpenNavigation = () => {
    const { departure_lat, departure_lng, arrival_lat, arrival_lng } = currentMission;

    if (!departure_lat || !departure_lng || !arrival_lat || !arrival_lng) {
      Alert.alert('Erreur', 'Coordonnées GPS manquantes pour cette mission');
      return;
    }

    Alert.alert(
      '🗺️ Choisir l\'application de navigation',
      'Sélectionnez votre application préférée',
      [
        {
          text: '📍 Google Maps',
          onPress: () => openGoogleMaps(departure_lat, departure_lng, arrival_lat, arrival_lng),
        },
        {
          text: '🚗 Waze',
          onPress: () => openWaze(arrival_lat, arrival_lng),
        },
        ...(Platform.OS === 'ios'
          ? [
              {
                text: '🍎 Apple Maps',
                onPress: () => openAppleMaps(departure_lat, departure_lng, arrival_lat, arrival_lng),
              },
            ]
          : []),
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  // =====================================
  // ACTIONS
  // =====================================
  const handleStartMission = async () => {
    if (hasActiveMission) {
      Alert.alert('Mission impossible', 'Vous avez déjà une mission en cours.');
      return;
    }

    try {
      const updated = await startMission(currentMission.id);
      
      // ✅ RECHARGER LA MISSION COMPLÈTE AVEC LES OBJETS IMBRIQUÉS
      const fullMission = await getMissionById(currentMission.id);
      setCurrentMission(fullMission);
      setTruck(fullMission.truck || null);
      
      Alert.alert('Succès', 'Mission démarrée avec succès !');
    } catch (error) {
      console.error('Start mission error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la mission.');
    }
  };

  const handleEndMission = async () => {
    try {
      const updated = await completeMission(currentMission.id);
      
      // ✅ RECHARGER LA MISSION COMPLÈTE
      const fullMission = await getMissionById(currentMission.id);
      setCurrentMission(fullMission);
      
      Alert.alert('Succès', 'Mission terminée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error('Complete mission error:', e);
      Alert.alert('Erreur', 'Impossible de terminer la mission.');
    }
  };

  // =====================================
  // HELPERS
  // =====================================
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'completed':
        return COLORS.info;
      default:
        return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminée';
      default:
        return 'Inconnu';
    }
  };

  const InfoRow = ({ icon, label, value, color = COLORS.text }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );

  const blockedByActiveMission = currentMission.status === 'pending' && hasActiveMission;

  // Check if GPS coordinates exist
  const hasGPSCoordinates =
    currentMission.departure_lat &&
    currentMission.departure_lng &&
    currentMission.arrival_lat &&
    currentMission.arrival_lng;

  // =====================================
  // RENDER
  // =====================================
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Détails de la mission</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* STATUS */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(currentMission.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(currentMission.status) }]}>
              {getStatusLabel(currentMission.status)}
            </Text>
          </View>

          <Text style={styles.missionId}>Mission #{currentMission.id}</Text>
        </View>

        {/* 🗺️ NAVIGATION BUTTON */}
        {hasGPSCoordinates && (
          <View style={styles.navigationSection}>
            <TouchableOpacity style={styles.navigationButton} onPress={handleOpenNavigation}>
              <View style={styles.navigationButtonContent}>
                <Ionicons name="navigate" size={24} color={COLORS.text} />
                <View style={styles.navigationButtonText}>
                  <Text style={styles.navigationButtonTitle}>Ouvrir l'itinéraire</Text>
                  <Text style={styles.navigationButtonSubtitle}>
                    Google Maps • Waze{Platform.OS === 'ios' ? ' • Apple Maps' : ''}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ROUTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinéraire</Text>

          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={styles.routeIndicator}>
                <View style={styles.dotStart} />
                <View style={styles.routeLine} />
              </View>

              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Départ</Text>
                <Text style={styles.routeCity}>{currentMission.departure_city}</Text>
                <Text style={styles.routeAddress}>{currentMission.departure_address}</Text>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.timeText}>{formatTime(currentMission.pickup_time)}</Text>
                </View>

                {currentMission.departure_lat && (
                  <Text style={styles.coordinatesSmall}>
                    📍 {currentMission.departure_lat.toFixed(4)}, {currentMission.departure_lng.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.routeItem}>
              <View style={styles.routeIndicator}>
                <View style={styles.dotEnd} />
              </View>

              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Arrivée</Text>
                <Text style={styles.routeCity}>{currentMission.arrival_city}</Text>
                <Text style={styles.routeAddress}>{currentMission.arrival_address}</Text>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.timeText}>
                    {formatTime(currentMission.expected_dropoff_time)}
                  </Text>
                </View>

                {currentMission.arrival_lat && (
                  <Text style={styles.coordinatesSmall}>
                    📍 {currentMission.arrival_lat.toFixed(4)}, {currentMission.arrival_lng.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.card}>
            <InfoRow icon="cube-outline" label="Conteneur" value={currentMission.container_number} />
            <InfoRow icon="resize-outline" label="Type" value={currentMission.container_type} />
            <InfoRow icon="navigate-outline" label="Distance" value={`${currentMission.distance} km`} />
            <InfoRow
              icon="cash-outline"
              label="Coût carburant estimé"
              value={`${currentMission.estimated_fuel_cost} DH`}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* TRUCK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camion assigné</Text>

          <View style={styles.truckCard}>
            <View style={styles.truckHeader}>
              <View style={styles.truckIconContainer}>
                <Ionicons name="car-sport" size={32} color={COLORS.primary} />
              </View>

              <View style={styles.truckInfo}>
                <Text style={styles.truckBrand}>{truck?.brand || 'N/A'}</Text>
                <Text style={styles.truckPlate}>{truck?.plate || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.truckDetails}>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Capacité</Text>
                <Text style={styles.truckDetailValue}>{truck?.capacity || 0} kg</Text>
              </View>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Puissance</Text>
                <Text style={styles.truckDetailValue}>{truck?.power || 0} CV</Text>
              </View>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Motorisation</Text>
                <Text style={styles.truckDetailValue}>{truck?.motorization || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* MESSAGE DE BLOCAGE */}
      {blockedByActiveMission && (
        <View style={styles.actionContainer}>
          <Text style={{ color: COLORS.warning, textAlign: 'center' }}>
            Une mission est déjà en cours. Terminez-la avant d'en démarrer une autre.
          </Text>
        </View>
      )}

      {/* ACTION BUTTONS */}
      {currentMission.status === 'pending' && !blockedByActiveMission && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartMission}>
            <Ionicons name="play-circle" size={24} color={COLORS.text} />
            <Text style={styles.startButtonText}>Démarrer la mission</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentMission.status === 'in_progress' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.endButton} onPress={handleEndMission}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.text} />
            <Text style={styles.endButtonText}>Terminer la mission</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentMission.status === 'completed' && (
        <View style={styles.actionContainer}>
          <Text style={{ color: COLORS.textMuted, textAlign: 'center' }}>
            Mission terminée — consultation uniquement
          </Text>
        </View>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  statusContainer: { alignItems: 'center', marginBottom: 24 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  statusText: { fontSize: 14, fontWeight: '700' },
  missionId: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  
  // 🗺️ NAVIGATION SECTION
  navigationSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  navigationButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navigationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navigationButtonText: {
    flex: 1,
  },
  navigationButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  navigationButtonSubtitle: {
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.8,
  },

  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  routeCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 24 },
  routeItem: { flexDirection: 'row', marginBottom: 16 },
  routeIndicator: { alignItems: 'center', marginRight: 16 },
  dotStart: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.success },
  routeLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  dotEnd: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary },
  routeContent: { flex: 1 },
  routeLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  routeCity: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  routeAddress: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  timeText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  coordinatesSmall: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 24 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600' },
  truckCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 24 },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  truckIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  truckBrand: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  truckPlate: { fontSize: 16, color: COLORS.textSecondary },
  truckDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  truckDetailItem: { alignItems: 'center' },
  truckDetailLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  truckDetailValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
});

export default MissionDetailsScreen;