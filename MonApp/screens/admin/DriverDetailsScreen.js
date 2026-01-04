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
  getDriverById,
  getMissions,
  deleteDriver,
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
// DRIVER DETAILS SCREEN (ADMIN)
// =====================================
const DriverDetailsScreen = ({ route, navigation }) => {
  const { driverId } = route.params;

  const [driver, setDriver] = useState(null);
  const [currentMission, setCurrentMission] = useState(null);

  // =====================================
  // LOAD DRIVER + MISSIONS
  // =====================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const driverData = await getDriverById(driverId);
        setDriver(driverData);

        const missions = await getMissions();

        const driverMissions = missions.filter(
          (m) => m.driver && m.driver.id === driverId
        );

        const active = driverMissions.find(
          (m) => m.status === 'in_progress'
        );

        setCurrentMission(
          active
            ? `${active.departure_city} → ${active.arrival_city}`
            : null
        );
      } catch (e) {
        console.error('DriverDetails load error:', e);
      }
    };

    loadData();
  }, [driverId]);

  // =====================================
  // ACTIONS
  // =====================================
  const handleEdit = () => {
    navigation.navigate('EditDriver', { driverId, driver });
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le chauffeur',
      `Êtes-vous sûr de vouloir supprimer ${driver.name} ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting driver:', driverId);
              await deleteDriver(driverId);
              Alert.alert('Succès', 'Chauffeur supprimé avec succès', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (e) {
              console.error('Delete driver error:', e);
              
              // Plus de détails sur l'erreur
              const errorMessage = e.message || 'Erreur inconnue';
              
              Alert.alert(
                'Erreur de suppression', 
                `Impossible de supprimer le chauffeur.\n\n${errorMessage}\n\nVérifiez qu'il n'a pas de missions associées.`
              );
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

  if (!driver) return null;

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

          <Text style={styles.headerTitle}>Détails Chauffeur</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={64} color={COLORS.text} />
          </View>

          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverId}>ID: {driver.id}</Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: driver.is_active
                  ? COLORS.success + '20'
                  : COLORS.textMuted + '20',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: driver.is_active
                    ? COLORS.success
                    : COLORS.textMuted,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: driver.is_active
                    ? COLORS.success
                    : COLORS.textMuted,
                },
              ]}
            >
              {driver.is_active ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        {/* INFOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.card}>
            <InfoRow icon="mail-outline" label="Email" value={driver.email} />
            <InfoRow icon="call-outline" label="Téléphone" value={driver.phone} />
            <InfoRow
              icon="time-outline"
              label="Heures travaillées"
              value={`${(driver.hours_worked || 0).toFixed(1)}h`}
            />
            <InfoRow
              icon="hourglass-outline"
              label="Heures restantes"
              value={`${Math.max(0, (driver.contractual_hours || 40) - (driver.hours_worked || 0)).toFixed(1)}h`}
            />
            <InfoRow
              icon="contract-outline"
              label="Heures contractuelles"
              value={`${driver.contractual_hours || 40}h`}
            />
            <InfoRow
              icon="calendar-outline"
              label="Mission en cours"
              value={currentMission || 'Aucune'}
            />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('DriverHistory', { 
                driverId,
                driverName: driver.name 
              })
            }
          >
            <Ionicons name="time-outline" size={24} color={COLORS.success} />
            <Text style={styles.actionButtonText}>
              Historique des missions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// =====================================
// STYLES (INCHANGÉS)
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  driverId: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
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
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
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
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default DriverDetailsScreen;
