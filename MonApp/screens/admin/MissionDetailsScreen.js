import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🌐 API
import {
  getMissionById,
  cancelMission,
} from '../../services/api';

// =====================================
// COULEURS LOCALES (SAFE)
// =====================================
const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// MISSION DETAIL SCREEN (ADMIN)
// =====================================
const MissionDetailScreen = ({ route, navigation }) => {
  const { missionId } = route.params;

  const [mission, setMission] = useState(null);

  // =====================================
  // LOAD MISSION
  // =====================================
  useEffect(() => {
    const loadMission = async () => {
      try {
        const data = await getMissionById(missionId);
        setMission(data);
      } catch (e) {
        console.error('Mission detail load error:', e);
      }
    };

    loadMission();
  }, [missionId]);

  // =====================================
  // STATUS HELPERS
  // =====================================
  const getStatusInfo = (status) => {
    switch (status) {
      case 'in_progress':
        return { label: 'En cours', color: COLORS.success };
      case 'pending':
        return { label: 'En attente', color: COLORS.warning };
      case 'completed':
        return { label: 'Terminée', color: COLORS.info };
      case 'cancelled':
        return { label: 'Annulée', color: COLORS.primary };
      default:
        return { label: 'Inconnu', color: COLORS.textMuted };
    }
  };

  // =====================================
  // ACTIONS
  // =====================================
  const handleEdit = () => {
    Alert.alert('Modifier', 'Fonctionnalité à implémenter');
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la mission',
      'Êtes-vous sûr de vouloir annuler cette mission ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMission(mission.id);
              Alert.alert('Succès', 'Mission annulée');
              navigation.goBack();
            } catch (e) {
              console.error('Cancel mission error:', e);
              Alert.alert('Erreur', 'Impossible d’annuler la mission');
            }
          },
        },
      ]
    );
  };


  // =====================================
  // UI HELPERS
  // =====================================
  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  if (!mission) return null;

  const statusInfo = getStatusInfo(mission.status);

  // =====================================
  // RENDER
  // =====================================
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('AdminDashboard');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Détails Mission</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* STATUS */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.missionId}>{mission.id}</Text>
        </View>

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
                <Text style={styles.routeCity}>
                  {mission.departure_city}
                </Text>
              </View>
            </View>

            <View style={styles.routeItem}>
              <View style={styles.routeIndicator}>
                <View style={styles.dotEnd} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Arrivée</Text>
                <Text style={styles.routeCity}>
                  {mission.arrival_city}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.card}>
            <InfoRow
              icon="navigate-outline"
              label="Distance"
              value={`${mission.distance} km`}
            />
            <InfoRow
              icon="time-outline"
              label="Heure de prise"
              value={new Date(mission.pickup_time).toLocaleTimeString(
                'fr-FR',
                { hour: '2-digit', minute: '2-digit' }
              )}
            />
          </View>
        </View>

        {/* ASSIGNATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignation</Text>

          <View style={styles.card}>
            {mission.driver && mission.truck ? (
              <>
                <View style={styles.assignRow}>
                  <View style={styles.assignLeft}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.assignLabel}>Chauffeur</Text>
                  </View>
                  <Text style={styles.assignValue}>
                    {mission.driver.name}
                  </Text>
                </View>

                <View style={styles.assignRow}>
                  <View style={styles.assignLeft}>
                    <Ionicons
                      name="car-sport-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.assignLabel}>Camion</Text>
                  </View>
                  <Text style={styles.assignValue}>
                    {mission.truck.plate}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.unassignedContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={COLORS.warning}
                />
                <Text style={styles.unassignedText}>
                  Mission non assignée
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ACTIONS */}
        {mission.status === 'pending' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cancelButtonText}>
                Annuler la mission
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// =====================================
// STYLES (STRICTEMENT IDENTIQUES)
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusText: { fontSize: 14, fontWeight: '700' },
  missionId: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  routeItem: { flexDirection: 'row', marginBottom: 16 },
  routeIndicator: { alignItems: 'center', marginRight: 16 },
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
  routeContent: { flex: 1 },
  routeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  routeCity: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
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
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  assignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  assignLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assignLabel: { fontSize: 14, color: COLORS.textSecondary },
  assignValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  unassignedContainer: { alignItems: 'center', paddingVertical: 24 },
  unassignedText: {
    fontSize: 16,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default MissionDetailScreen;
