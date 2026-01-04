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
  getTruckById,
  deleteTruck,
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
// TRUCK DETAILS SCREEN (ADMIN)
// =====================================
const TruckDetailsScreen = ({ route, navigation }) => {
  const { truckId } = route.params;

  const [truck, setTruck] = useState(null);

  // =====================================
  // LOAD TRUCK
  // =====================================
  useEffect(() => {
    const loadTruck = async () => {
      try {
        const data = await getTruckById(truckId);
        setTruck(data);
      } catch (e) {
        console.error('Truck detail load error:', e);
      }
    };

    loadTruck();
  }, [truckId]);

  // =====================================
  // HELPERS
  // =====================================
  const getFuelPercentage = () => {
    if (!truck || !truck.tank_capacity) return 0;
    return Math.round(
      (truck.current_fuel / truck.tank_capacity) * 100
    );
  };

  const getFuelColor = (percentage) => {
    if (percentage > 50) return COLORS.success;
    if (percentage > 25) return COLORS.warning;
    return COLORS.primary;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { label: 'Disponible', color: COLORS.success };
      case 'in_mission':
        return { label: 'En mission', color: COLORS.info };
      case 'maintenance':
        return { label: 'Maintenance', color: COLORS.warning };
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

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le camion',
      'Êtes-vous sûr de vouloir supprimer ce camion ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTruck(truck.id);
              Alert.alert('Supprimé', 'Camion supprimé avec succès');
              navigation.goBack();
            } catch (e) {
              console.error('Delete truck error:', e);
              Alert.alert('Erreur', 'Impossible de supprimer le camion');
            }
          },
        },
      ]
    );
  };

  if (!truck) return null;

  const fuelPercentage = getFuelPercentage();
  const fuelColor = getFuelColor(fuelPercentage);
  const statusInfo = getStatusInfo(truck.status);

  // =====================================
  // UI COMPONENT
  // =====================================
  const DetailCard = ({ icon, label, value, color }) => (
    <View style={styles.detailCard}>
      <View style={[styles.detailIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

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

          <Text style={styles.headerTitle}>Détails Camion</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* TRUCK IMAGE */}
        <View style={styles.truckImageContainer}>
          <Ionicons name="car-sport" size={120} color={COLORS.primary} />
        </View>

        {/* MAIN INFO */}
        <View style={styles.mainCard}>
          <Text style={styles.truckBrand}>{truck.brand}</Text>
          <Text style={styles.truckPlate}>{truck.plate}</Text>
          <Text style={styles.truckId}>{truck.id}</Text>

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
        </View>

        {/* FUEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de carburant</Text>

          <View style={styles.card}>
            <View style={styles.fuelHeader}>
              <View style={styles.fuelIconContainer}>
                <Ionicons name="water" size={32} color={fuelColor} />
              </View>
              <View>
                <Text style={styles.fuelPercentage}>
                  {fuelPercentage}%
                </Text>
                <Text style={styles.fuelLiters}>
                  {truck.current_fuel}L / {truck.tank_capacity}L
                </Text>
              </View>
            </View>

            <View style={styles.fuelBarContainer}>
              <View
                style={[
                  styles.fuelBar,
                  {
                    width: `${fuelPercentage}%`,
                    backgroundColor: fuelColor,
                  },
                ]}
              />
            </View>

            {fuelPercentage < 30 && (
              <View style={styles.warning}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={COLORS.warning}
                />
                <Text style={styles.warningText}>
                  Niveau de carburant bas - Remplissage nécessaire
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* CHARACTERISTICS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>

          <View style={styles.detailsGrid}>
            <DetailCard
              icon="cube-outline"
              label="Capacité"
              value={`${truck.capacity / 1000}T`}
              color={COLORS.success}
            />
            <DetailCard
              icon="speedometer-outline"
              label="Puissance"
              value={`${truck.power} CV`}
              color={COLORS.primary}
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
              value={`${truck.tank_capacity}L`}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert('Maintenance', 'Planifier une maintenance')
            }
          >
            <Ionicons name="build-outline" size={24} color={COLORS.warning} />
            <Text style={styles.actionButtonText}>
              Planifier maintenance
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
  truckImageContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 32,
    borderRadius: 16,
  },
  mainCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  truckBrand: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  truckPlate: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  truckId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  fuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  fuelIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fuelPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  fuelLiters: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  fuelBarContainer: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fuelBar: {
    height: '100%',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
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

export default TruckDetailsScreen;
