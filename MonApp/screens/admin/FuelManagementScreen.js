import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 🌐 API
import { getFuelData, getTrucks, createFuelEntry } from '../../services/api';

// =====================================
// COULEURS
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
// SCREEN
// =====================================


const FuelManagementScreen = ({ navigation }) => {
  const [fuelEntries, setFuelEntries] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [truckMap, setTruckMap] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'
  const [pricePerLiter] = useState(15);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [liters, setLiters] = useState('');

  // =====================================
  // LOAD DATA - AUTO REFRESH ✅
  // =====================================
  const loadData = useCallback(async () => {
    try {
      const [fuelData, trucksData] = await Promise.all([
        getFuelData(),
        getTrucks(),
      ]);

      // 🔹 map camion id -> label lisible
      const map = {};
      trucksData.forEach((t) => {
        map[t.id] = `${t.brand} - ${t.plate}`;
      });

      // 🔹 tri par date décroissante
      const sortedFuel = [...fuelData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTruckMap(map);
      setFuelEntries(sortedFuel);
      setTrucks(trucksData);
    } catch (e) {
      console.error('Fuel load error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // =====================================
  // CALCULATE TOTALS - FILTERED ✅
  // =====================================
  const calculateTotals = () => {
    let filtered = fuelEntries;

    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = fuelEntries.filter(
        (e) => new Date(e.created_at) >= weekAgo
      );
    } else if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = fuelEntries.filter(
        (e) => new Date(e.created_at) >= monthAgo
      );
    }

    const totalLiters = filtered.reduce(
      (sum, e) => sum + (e.quantity || 0),
      0
    );

    const totalCost = filtered.reduce(
      (sum, e) => sum + (Number(e.cost) || 0),
      0
    );

    return {
      totalLiters,
      totalCost,
      count: filtered.length,
      filtered,
    };
  };

  const { totalLiters, totalCost, count, filtered } = calculateTotals();

  // =====================================
  // HELPERS
  // =====================================
  const getTruckLabel = (truckId) =>
    truckMap[truckId] || `Camion #${truckId}`;

  // =====================================
  // SELECT TRUCK
  // =====================================
  const handleSelectTruck = () => {
    Alert.alert(
      'Choisir un camion',
      '',
      [
        ...trucks.map((truck) => ({
          text: `${truck.brand} - ${truck.plate}`,
          onPress: () => setSelectedTruck(truck),
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  // =====================================
  // ADD FUEL (MANUAL)
  // =====================================
  const handleSubmitFuel = async () => {
    if (!selectedTruck) {
      Alert.alert('Erreur', 'Veuillez sélectionner un camion');
      return;
    }

    if (!liters || isNaN(liters) || Number(liters) <= 0) {
      Alert.alert('Erreur', 'Quantité invalide');
      return;
    }

    try {
      await createFuelEntry({
      truck: selectedTruck.id,
      quantity: Number(liters),
      price_per_liter: pricePerLiter,
      location: 'Station-service',
    });
      Alert.alert('Succès', 'Carburant ajouté');

      setLiters('');
      setSelectedTruck(null);

      await loadData();
    } catch (e) {
      console.error('Fuel create error:', e);
      Alert.alert('Erreur', 'Échec de l’enregistrement');
    }
  };

  // =====================================
  // FULL TANK
  // =====================================
  const handleFullTank = async (truck) => {
    const litersToAdd = truck.tank_capacity - truck.current_fuel;

    if (litersToAdd <= 0) {
      Alert.alert('Info', 'Le réservoir est déjà plein');
      return;
    }

    try {
     await createFuelEntry({
      truck: truck.id,
      quantity: litersToAdd,
      price_per_liter: pricePerLiter,
      location: 'Station-service',
    });


      Alert.alert(
        'Succès',
        `Plein effectué : +${litersToAdd.toFixed(1)} L`
      );

      await loadData();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de faire le plein');
    }
  };
  // =====================================
  // RENDER
  // =====================================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion Carburant</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATS */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Ionicons name="water" size={32} color={COLORS.primary} />
              <View style={styles.statsContent}>
                <Text style={styles.statValue}>
                  {totalCost.toFixed(0)} DH
                </Text>
                <Text style={styles.statLabel}>Total dépensé</Text>
              </View>
            </View>

            <View style={styles.statsMeta}>
              <View style={styles.statsMetaItem}>
                <Ionicons
                  name="water-outline"
                  size={16}
                  color={COLORS.info}
                />
                <Text style={styles.statsMetaText}>
                  {totalLiters.toFixed(0)} L
                </Text>
              </View>

              <View style={styles.statsMetaItem}>
                <Ionicons
                  name="receipt-outline"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.statsMetaText}>
                  {count} pleins
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filters}
          >
            {['all', 'week', 'month'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  filter === f && styles.filterChipActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f === 'all'
                    ? 'Tout'
                    : f === 'week'
                    ? '7 jours'
                    : 'Ce mois'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ADD FUEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter carburant</Text>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectTruck}
          >
            <Text style={styles.selectText}>
              {selectedTruck
                ? `${selectedTruck.brand} - ${selectedTruck.plate}`
                : 'Sélectionner un camion'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={liters}
            onChangeText={setLiters}
            keyboardType="numeric"
            placeholder="Litres ajoutés"
            placeholderTextColor={COLORS.textMuted}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmitFuel}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.primaryButtonText}>Enregistrer</Text>
          </TouchableOpacity>

          {selectedTruck && (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: COLORS.info, marginTop: 12 },
              ]}
              onPress={() => handleFullTank(selectedTruck)}
            >
              <Ionicons
                name="battery-charging"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.primaryButtonText}>
                Faire le plein
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* HISTORY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique ({count})</Text>

          {filtered.length === 0 && (
            <Text
              style={{
                color: COLORS.textMuted,
                textAlign: 'center',
                paddingVertical: 24,
              }}
            >
              Aucun enregistrement pour cette période
            </Text>
          )}

          {filtered.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="water"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.cardTitle}>
                  {getTruckLabel(entry.truck)}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Quantité</Text>
                  <Text style={styles.cardValue}>
                    {entry.quantity} L
                  </Text>
                </View>

                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Coût</Text>
                  <Text
                    style={[
                      styles.cardValue,
                      { color: COLORS.primary },
                    ]}
                  >
                    {Number(entry.cost).toFixed(2)} DH
                  </Text>
                </View>
              </View>

              <Text style={styles.date}>
                {new Date(entry.created_at).toLocaleDateString(
                  'fr-FR',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </Text>
            </View>
          ))}
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
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContent: { marginLeft: 16 },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsMetaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filters: { flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 999,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectText: { color: COLORS.text, fontSize: 16 },
  input: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    color: COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  cardContent: { gap: 8, marginBottom: 8 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { color: COLORS.textMuted, fontSize: 14 },
  cardValue: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default FuelManagementScreen;
