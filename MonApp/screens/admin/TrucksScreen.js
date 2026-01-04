import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🌐 API
import { getTrucks, getMissions } from '../../services/api';

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
// TRUCKS SCREEN (ADMIN)
// =====================================
const TruckScreen = ({ navigation }) => {
  const [trucks, setTrucks] = useState([]);
  const [missions, setMissions] = useState([]);

  // =====================================
  // LOAD DATA
  // =====================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trucksData, missionsData] = await Promise.all([
          getTrucks(),
          getMissions(),
        ]);

        setTrucks(trucksData);
        setMissions(missionsData);
      } catch (e) {
        console.error('TruckScreen load error:', e);
      }
    };

    loadData();
  }, []);

  // =====================================
  // HELPERS
  // =====================================
  const getTruckStatus = (truckId) => {
    const activeMission = missions.find(
      (m) => m.truck && m.truck.id === truckId && m.status === 'in_progress'
    );

    if (activeMission) return 'in_mission';
    return 'available';
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
  const handleAddTruck = () => {
    Alert.alert('Ajouter un camion', 'Fonctionnalité à implémenter');
  };

  const handleTruckPress = (truck) => {
    navigation.navigate('TruckDetails', {
      truck,
    });
  };

  // =====================================
  // CARD
  // =====================================
  const TruckCard = ({ truck }) => {
    const status = getTruckStatus(truck.id);
    const statusInfo = getStatusInfo(status);

    return (
      <TouchableOpacity
        style={styles.truckCard}
        onPress={() => handleTruckPress(truck)}
        activeOpacity={0.7}
      >
        <View style={styles.truckHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={32} color={COLORS.text} />
          </View>

          <View style={styles.truckInfo}>
            <Text style={styles.truckBrand}>{truck.brand}</Text>
            <Text style={styles.truckPlate}>{truck.plate}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusInfo.color },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: statusInfo.color },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.truckStats}>
          <View style={styles.stat}>
            <Ionicons
              name="water-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.statText}>
              {truck.current_fuel}L / {truck.tank_capacity}L
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={COLORS.info}
            />
            <Text style={styles.statText}>
              {truck.power} CV
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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

        <Text style={styles.headerTitle}>Camions</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTruck}
        >
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={trucks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TruckCard truck={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// =====================================
// STYLES (UI INCHANGÉ)
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 24 },
  truckCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  truckInfo: { flex: 1 },
  truckBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  truckPlate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  truckStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: COLORS.textSecondary },
});

export default TruckScreen;
