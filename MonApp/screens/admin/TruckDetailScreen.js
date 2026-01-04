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
  const truckParam = route?.params?.truck;
  const truckIdParam = route?.params?.truckId;

  const [truck, setTruck] = useState(truckParam || null);
  const [loading, setLoading] = useState(!truckParam);
  const [error, setError] = useState(null);

  // =====================================
  // LOAD TRUCK
  // =====================================
  useEffect(() => {
    if (truckParam) {
      setLoading(false);
      return;
    }

    if (!truckIdParam) {
      setError('ID du camion manquant');
      setLoading(false);
      return;
    }

    const loadTruck = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTruckById(truckIdParam);
        setTruck(data);
      } catch (e) {
        console.error('Truck detail load error:', e);
        setError('Impossible de charger les détails du camion');
      } finally {
        setLoading(false);
      }
    };

    loadTruck();
  }, [truckIdParam, truckParam]);

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

  const getStatusInfo = () => {
    if (!truck) return { label: 'Inconnu', color: COLORS.textMuted };
    
    if (truck.is_available === true) {
      return { label: 'Disponible', color: COLORS.success };
    } else if (truck.is_available === false) {
      return { label: 'Non disponible', color: COLORS.warning };
    }
    
    return { label: 'Inconnu', color: COLORS.textMuted };
  };

  // =====================================
  // ACTIONS
  // =====================================
// =====================================
// ACTIONS
// =====================================
// =====================================
// ACTIONS
// =====================================
  const handleDelete = () => {
    Alert.alert(
      '⚠️ Supprimer le camion',
      `Êtes-vous sûr de vouloir supprimer ${truck.brand} (${truck.plate}) ?\n\n⚠️ Ce camion ne doit pas avoir de missions en cours (pending ou in_progress).\n\nLes missions terminées garderont la référence du camion.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTruck(truck.id);
              
              // ✅ Suppression réussie
              Alert.alert('✅ Succès', 'Camion supprimé avec succès', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Delete truck error:', error);
              
              // ❌ Extraire le message d'erreur du backend
              let errorMessage = 'Impossible de supprimer le camion';
              
              // Vérifier si l'erreur vient du backend (response.data)
              if (error.response && error.response.data) {
                if (error.response.data.error) {
                  errorMessage = error.response.data.error;
                } else if (error.response.data.message) {
                  errorMessage = error.response.data.message;
                }
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              // Afficher l'erreur détaillée
              Alert.alert('❌ Suppression impossible', errorMessage);
            }
          },
        },
      ]
    );
  };
  // =====================================
  // LOADING & ERROR STATES
  // =====================================
  if (!truckIdParam && !truckParam) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle" size={64} color={COLORS.primary} />
        <Text style={{ color: COLORS.text, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
          ID du camion manquant
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 24, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="refresh" size={48} color={COLORS.primary} />
        <Text style={{ color: COLORS.text, fontSize: 16, marginTop: 16 }}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle" size={64} color={COLORS.primary} />
        <Text style={{ color: COLORS.text, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 24, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!truck) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle" size={64} color={COLORS.primary} />
        <Text style={{ color: COLORS.text, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
          Camion introuvable
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 24, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fuelPercentage = getFuelPercentage();
  const fuelColor = getFuelColor(fuelPercentage);
  const statusInfo = getStatusInfo();

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

          <View style={styles.infoButton}>
            <Ionicons name="information-circle" size={24} color={COLORS.info} />
          </View>
        </View>

        {/* TRUCK IMAGE */}
        <View style={styles.truckImageContainer}>
          <Ionicons name="car-sport" size={120} color={COLORS.primary} />
        </View>

        {/* MAIN INFO */}
        <View style={styles.mainCard}>
          <Text style={styles.truckBrand}>{truck.brand}</Text>
          <Text style={styles.truckPlate}>{truck.plate}</Text>
          <Text style={styles.truckId}>ID: #{truck.id}</Text>

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
              <View style={[styles.fuelIconContainer, { backgroundColor: fuelColor + '20' }]}>
                <Ionicons name="water" size={32} color={fuelColor} />
              </View>
              <View>
                <Text style={[styles.fuelPercentage, { color: fuelColor }]}>
                  {fuelPercentage}%
                </Text>
                <Text style={styles.fuelLiters}>
                  {truck.current_fuel.toFixed(1)}L / {truck.tank_capacity}L
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
              value={`${(truck.capacity / 1000).toFixed(1)}T`}
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

        {/* CONSUMPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consommation</Text>

          <View style={styles.card}>
            <View style={styles.consumptionRow}>
              <View style={styles.consumptionLeft}>
                <Ionicons name="speedometer" size={24} color={COLORS.info} />
                <Text style={styles.consumptionLabel}>Consommation moyenne</Text>
              </View>
              <Text style={styles.consumptionValue}>
                {truck.avg_consumption ? `${truck.avg_consumption.toFixed(1)} L/100km` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.deleteButtonText}>Supprimer le camion</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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
  infoButton: {
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
  consumptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consumptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consumptionLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  consumptionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.info,
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