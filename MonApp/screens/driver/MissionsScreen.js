import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import MissionCard from '../../components/MissionCard';
import { getMissions } from '../../services/api';
import { useAuth } from '../../context/AuthContext';



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
// MISSIONS SCREEN
// =====================================
const MissionsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const [activeMission, setActiveMission] = useState(null);
  const [pendingMissions, setPendingMissions] = useState([]);

  // 🔐 UTILISATEUR CONNECTÉ
  const { user } = useAuth();

  // =====================================
  // LOAD DATA FROM API (MISSIONS DU COMPTE CONNECTÉ)
  // =====================================
  useFocusEffect(
    useCallback(() => {
      const loadMissions = async () => {
        try {
          const missions = await getMissions();

          // 🔐 FILTRAGE PAR EMAIL DU DRIVER CONNECTÉ
          const myMissions = missions.filter(
            (m) => m.driver && m.driver.email === user.email
          );

          const active = myMissions.find(
            (m) => m.status === 'in_progress'
          );

          const pending = myMissions.filter(
            (m) => m.status === 'pending'
          );

          setActiveMission(active || null);
          setPendingMissions(pending);
        } catch (e) {
          console.error('Missions load error:', e);
        }
      };

      if (user?.email) {
        loadMissions();
      }
    }, [user])
  );



  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Missions</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {pendingMissions.length + (activeMission ? 1 : 0)}
          </Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'active' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name="play-circle"
            size={20}
            color={
              activeTab === 'active'
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            En cours
          </Text>

          {activeMission && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'pending' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons
            name="time"
            size={20}
            color={
              activeTab === 'pending'
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.tabTextActive,
            ]}
          >
            En attente
          </Text>

          {pendingMissions.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {pendingMissions.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE */}
        {activeTab === 'active' && (
          <View style={styles.contentContainer}>
            {activeMission ? (
              <>
                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={COLORS.info}
                  />
                  <Text style={styles.infoText}>
                    Mission actuellement en cours
                  </Text>
                </View>

                <MissionCard
                  mission={activeMission}
                  onPress={() =>
                    navigation.navigate('MissionDetails', {
                      mission: activeMission,
                    })
                  }
                />
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={80}
                  color={COLORS.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  Aucune mission en cours
                </Text>
                <Text style={styles.emptyText}>
                  Vous n’avez pas de mission active pour le moment.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* PENDING */}
        {activeTab === 'pending' && (
          <View style={styles.contentContainer}>
            {activeMission && (
              <View style={styles.warningBox}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={COLORS.warning}
                />
                <Text style={styles.warningText}>
                  Terminez votre mission en cours avant d’en démarrer
                  une nouvelle
                </Text>
              </View>
            )}

            {pendingMissions.length > 0 ? (
              pendingMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onPress={() =>
                    navigation.navigate('MissionDetails', {
  mission,
  hasActiveMission: !!activeMission,
})

                  }
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={80}
                  color={COLORS.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  Aucune mission en attente
                </Text>
                <Text style={styles.emptyText}>
                  Vous êtes à jour ! Aucune nouvelle mission assignée.
                </Text>
              </View>
            )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.info,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default MissionsScreen;
