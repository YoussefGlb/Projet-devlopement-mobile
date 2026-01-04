import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 🌐 API
import { getDrivers, getMissions } from '../../services/api';

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
// DRIVERS SCREEN (ADMIN)
// =====================================
const DriversScreen = ({ navigation }) => {
  const [drivers, setDrivers] = useState([]);
  const [missions, setMissions] = useState([]);

  // =====================================
  // LOAD DRIVERS + MISSIONS - AUTO REFRESH ✅
  // =====================================
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [driversData, missionsData] = await Promise.all([
            getDrivers(),
            getMissions(),
          ]);

          setDrivers(driversData);
          setMissions(missionsData);
        } catch (e) {
          console.error('Drivers load error:', e);
        }
      };

      loadData();
    }, [])
  );

  // =====================================
  // HELPERS - SIMPLIFIED ✅
  // =====================================
  const getDriverStats = (driverId) => {
    const driverMissions = missions.filter(
      (m) => m.driver && m.driver.id === driverId
    );

    const activeMission = driverMissions.find(
      (m) => m.status === 'in_progress'
    );

    return {
      hasActiveMission: !!activeMission,
    };
  };

  // =====================================
  // ACTIONS - FIXED ✅
  // =====================================
  const handleAddDriver = () => {
    navigation.navigate('CreateDriver');
  };

  const handleDriverPress = (driver) => {
    navigation.navigate('DriverDetails', {
      driverId: driver.id,
    });
  };

  // =====================================
  // COMPONENT
  // =====================================
  const DriverCard = ({ driver }) => {
    const stats = getDriverStats(driver.id);

    return (
      <TouchableOpacity
        style={styles.driverCard}
        onPress={() => handleDriverPress(driver)}
        activeOpacity={0.7}
      >
        <View style={styles.driverHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color={COLORS.text} />
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverId}>ID: {driver.id}</Text>
          </View>

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

        <View style={styles.driverStats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>
              {(driver.hours_worked || 0).toFixed(1)}h / {driver.contractual_hours}h
            </Text>
          </View>

          {stats.hasActiveMission && (
            <View style={styles.stat}>
              <Ionicons
                name="navigate-outline"
                size={16}
                color={COLORS.info}
              />
              <Text style={styles.statText}>En mission</Text>
            </View>
          )}
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

        <Text style={styles.headerTitle}>Chauffeurs</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddDriver}
        >
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={drivers}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DriverCard driver={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 24 },
  driverCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: { flex: 1 },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  driverId: { fontSize: 14, color: COLORS.textSecondary },
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
  driverStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: COLORS.textSecondary },
});

export default DriversScreen;