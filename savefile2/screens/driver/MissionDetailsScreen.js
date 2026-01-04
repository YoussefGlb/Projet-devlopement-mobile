import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { formatTime, getTruckById } from '../../data/mockData';

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
// MISSION DETAILS SCREEN
// =====================================
const MissionDetailsScreen = ({ route, navigation }) => {
  const { mission } = route.params;
  const [currentMission, setCurrentMission] = useState(mission);
  const truck = getTruckById(currentMission.truckId);

  const handleStartMission = () => {
    Alert.alert(
      'Démarrer la mission',
      'Êtes-vous sûr de vouloir démarrer cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: () => {
            setCurrentMission({
              ...currentMission,
              status: 'in_progress',
              actualStartTime: new Date().toISOString(),
            });
            Alert.alert('Succès', 'Mission démarrée avec succès !');
          },
        },
      ]
    );
  };

  const handleEndMission = () => {
    Alert.alert(
      'Terminer la mission',
      'Êtes-vous sûr de vouloir terminer cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          style: 'destructive',
          onPress: () => {
            setCurrentMission({
              ...currentMission,
              status: 'completed',
              actualEndTime: new Date().toISOString(),
            });
            Alert.alert('Succès', 'Mission terminée avec succès !');
            navigation.goBack();
          },
        },
      ]
    );
  };

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
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
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(currentMission.status) },
              ]}
            >
              {getStatusLabel(currentMission.status)}
            </Text>
          </View>

          <Text style={styles.missionId}>{currentMission.id}</Text>
        </View>

        {/* ROUTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinéraire</Text>

          <View style={styles.routeCard}>
            {/* DEPART */}
            <View style={styles.routeItem}>
              <View style={styles.routeIndicator}>
                <View style={styles.dotStart} />
                <View style={styles.routeLine} />
              </View>

              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Départ</Text>
                <Text style={styles.routeCity}>
                  {currentMission.departureCity}
                </Text>
                <Text style={styles.routeAddress}>
                  {currentMission.departureAddress}
                </Text>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.timeText}>
                    {formatTime(currentMission.pickupTime)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ARRIVEE */}
            <View style={styles.routeItem}>
              <View style={styles.routeIndicator}>
                <View style={styles.dotEnd} />
              </View>

              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Arrivée</Text>
                <Text style={styles.routeCity}>
                  {currentMission.arrivalCity}
                </Text>
                <Text style={styles.routeAddress}>
                  {currentMission.arrivalAddress}
                </Text>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.timeText}>
                    {formatTime(currentMission.expectedDropoffTime)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.card}>
            <InfoRow
              icon="cube-outline"
              label="Conteneur"
              value={currentMission.containerNumber}
            />
            <InfoRow
              icon="resize-outline"
              label="Type"
              value={currentMission.containerType}
            />
            <InfoRow
              icon="navigate-outline"
              label="Distance"
              value={`${currentMission.distance} km`}
            />
            <InfoRow
              icon="cash-outline"
              label="Coût carburant estimé"
              value={`${currentMission.estimatedFuelCost} DH`}
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
                <Text style={styles.truckBrand}>{truck?.brand}</Text>
                <Text style={styles.truckPlate}>{truck?.plate}</Text>
              </View>
            </View>

            <View style={styles.truckDetails}>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Capacité</Text>
                <Text style={styles.truckDetailValue}>
                  {truck?.capacity} kg
                </Text>
              </View>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Puissance</Text>
                <Text style={styles.truckDetailValue}>
                  {truck?.power} CV
                </Text>
              </View>
              <View style={styles.truckDetailItem}>
                <Text style={styles.truckDetailLabel}>Motorisation</Text>
                <Text style={styles.truckDetailValue}>
                  {truck?.motorization}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ACTION BUTTONS */}
      {currentMission.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartMission}
          >
            <Ionicons name="play-circle" size={24} color={COLORS.text} />
            <Text style={styles.startButtonText}>Démarrer la mission</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentMission.status === 'in_progress' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndMission}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.endButtonText}>Terminer la mission</Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  missionId: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
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
  routeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
  },
  routeItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  dotStart: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  dotEnd: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  routeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  truckCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
  },
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
  truckBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  truckPlate: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  truckDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  truckDetailItem: {
    alignItems: 'center',
  },
  truckDetailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  truckDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
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
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default MissionDetailsScreen;
