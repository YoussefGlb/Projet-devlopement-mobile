import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🌐 API
import { getMissions } from '../../services/api';

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
// MISSIONS SCREEN (ADMIN)
// =====================================
const MissionsScreen = ({ navigation }) => {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('all');

  // =====================================
  // LOAD MISSIONS
  // =====================================
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const data = await getMissions();
        setMissions(data);
      } catch (e) {
        console.error('Missions load error:', e);
      }
    };

    loadMissions();
  }, []);

  // =====================================
  // STATUS HELPERS
  // =====================================
  const getStatusInfo = (status) => {
    switch (status) {
      case 'in_progress':
        return {
          label: 'En cours',
          color: COLORS.success,
          icon: 'play-circle',
        };
      case 'pending':
        return {
          label: 'En attente',
          color: COLORS.warning,
          icon: 'time',
        };
      case 'completed':
        return {
          label: 'Terminée',
          color: COLORS.info,
          icon: 'checkmark-circle',
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          color: COLORS.primary,
          icon: 'close-circle',
        };
      default:
        return {
          label: 'Inconnu',
          color: COLORS.textMuted,
          icon: 'help-circle',
        };
    }
  };

  // =====================================
  // COMPONENT
  // =====================================
  const MissionCard = ({ mission }) => {
    const statusInfo = getStatusInfo(mission.status);

    return (
      <TouchableOpacity
        style={styles.missionCard}
        onPress={() =>
          navigation.navigate('MissionDetail', {
            missionId: mission.id,
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.missionHeader}>
          <Text style={styles.missionId}>{mission.id}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <Ionicons
              name={statusInfo.icon}
              size={14}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoints}>
            <View style={styles.dotStart} />
            <View style={styles.routeLine} />
            <View style={styles.dotEnd} />
          </View>

          <View style={styles.routeDetails}>
            <View style={styles.cityRow}>
              <Text style={styles.cityLabel}>Départ</Text>
              <Text style={styles.cityName}>
                {mission.departure_city}
              </Text>
            </View>

            <View style={styles.cityRow}>
              <Text style={styles.cityLabel}>Arrivée</Text>
              <Text style={styles.cityName}>
                {mission.arrival_city}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.missionFooter}>
          {mission.driver ? (
            <View style={styles.assignInfo}>
              <Ionicons
                name="person-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.assignText}>
                {mission.driver.name}
              </Text>
            </View>
          ) : (
            <View style={styles.unassigned}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={COLORS.warning}
              />
              <Text style={styles.unassignedText}>
                Non assignée
              </Text>
            </View>
          )}

          <View style={styles.distance}>
            <Ionicons
              name="navigate-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.distanceText}>
              {mission.distance} km
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // =====================================
  // FILTER
  // =====================================
  const filteredMissions = missions.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

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

        <Text style={styles.headerTitle}>Missions</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateMission')}
        >
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'En attente' },
          { key: 'in_progress', label: 'En cours' },
          { key: 'completed', label: 'Terminées' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredMissions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MissionCard mission={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  list: { padding: 24 },
  missionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routePoints: {
    alignItems: 'center',
    marginRight: 12,
  },
  dotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  dotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cityRow: { marginBottom: 4 },
  cityLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assignInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  unassigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unassignedText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default MissionsScreen;
