import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import { useEffect, useState } from 'react';

// 🔐 FIREBASE LOGOUT
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

// 🌐 API
import {
  getDrivers,
  getTrucks,
  getMissions,
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
// ADMIN DASHBOARD
// =====================================
const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalTrucks: 0,
    activeMissions: 0,
    totalMissions: 0,
    completedToday: 0,
    pendingMissions: 0,
  });

  const [driversData, setDriversData] = useState([]);

  // =====================================
  // LOAD ADMIN STATS (GLOBAL)
  // =====================================
  const loadDashboard = async () => {
    try {
      const [drivers, trucks, missions] = await Promise.all([
        getDrivers(),
        getTrucks(),
        getMissions(),
      ]);

      setDriversData(drivers);

      const today = new Date().toDateString();

      const activeMissions = missions.filter(
        (m) => m.status === 'in_progress'
      );

      const pendingMissions = missions.filter(
        (m) => m.status === 'pending'
      );

      const completedToday = missions.filter(
        (m) =>
          m.status === 'completed' &&
          m.actual_end_time &&
          new Date(m.actual_end_time).toDateString() === today
      );

      setStats({
        totalDrivers: drivers.length,
        totalTrucks: trucks.length,
        activeMissions: activeMissions.length,
        totalMissions: missions.length,
        completedToday: completedToday.length,
        pendingMissions: pendingMissions.length,
      });
    } catch (e) {
      console.error('Admin dashboard error:', e);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================
  // 🔄 RESET WEEKLY HOURS
  // =====================================
  const handleResetWeeklyHours = () => {
    Alert.alert(
      '🔄 Réinitialiser les heures',
      'Voulez-vous remettre à zéro les heures travaillées de tous les chauffeurs ?\n\nCette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              // Appeler l'API pour reset tous les drivers
              const API_URL = 'http://192.168.3.50:8000/api';
              
              let resetCount = 0;
              const errors = [];

              for (const driver of driversData) {
                try {
                  const response = await fetch(`${API_URL}/drivers/${driver.id}/`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      ...driver,
                      hours_worked: 0,
                    }),
                  });

                  if (response.ok) {
                    resetCount++;
                  } else {
                    errors.push(driver.name);
                  }
                } catch (err) {
                  errors.push(driver.name);
                  console.error(`Erreur reset ${driver.name}:`, err);
                }
              }

              // Recharger le dashboard
              await loadDashboard();

              // Afficher le résultat
              if (errors.length === 0) {
                Alert.alert(
                  '✅ Succès',
                  `Les heures de ${resetCount} chauffeur(s) ont été réinitialisées avec succès !`
                );
              } else {
                Alert.alert(
                  '⚠️ Partiellement réussi',
                  `${resetCount} chauffeur(s) réinitialisé(s).\n\nErreurs: ${errors.join(', ')}`
                );
              }
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert(
                '❌ Erreur',
                'Impossible de réinitialiser les heures. Vérifiez votre connexion.'
              );
            }
          },
        },
      ]
    );
  };

  /* =========================
     LOGOUT (IDENTIQUE PROFILE)
  ========================= */
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (e) {
              console.error('Logout error:', e);
            }
          },
        },
      ]
    );
  };

  // =====================================
  // COMPONENTS
  // =====================================
  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.statIconContainer,
          { backgroundColor: color + '20' },
        ]}
      >
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: color + '20' },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textMuted}
      />
    </TouchableOpacity>
  );

  // =====================================
  // RENDER
  // =====================================
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Tableau de bord</Text>
          <Text style={styles.userName}>Administrateur</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 16 }}>

          <TouchableOpacity onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="people-outline"
          label="Chauffeurs"
          value={stats.totalDrivers}
          color={COLORS.primary}
          onPress={() => navigation.navigate('Drivers')}
        />
        <StatCard
          icon="car-sport-outline"
          label="Camions"
          value={stats.totalTrucks}
          color={COLORS.success}
          onPress={() => navigation.navigate('Trucks')}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="play-circle-outline"
          label="En cours"
          value={stats.activeMissions}
          color={COLORS.info}
          onPress={() => navigation.navigate('Missions')}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Terminées aujourd'hui"
          value={stats.completedToday}
          color={COLORS.success}
          onPress={() => navigation.navigate('Missions')}
        />
      </View>

      {/* 🔄 RESET BUTTON */}
      <View style={styles.resetSection}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetWeeklyHours}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-circle" size={24} color={COLORS.text} />
          <View style={styles.resetContent}>
            <Text style={styles.resetTitle}>Réinitialiser les heures hebdomadaires</Text>
            <Text style={styles.resetSubtitle}>
              Remettre à zéro les heures de tous les chauffeurs
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <QuickActionCard
          icon="add-circle-outline"
          title="Nouvelle mission"
          subtitle="Créer et assigner une mission"
          onPress={() => navigation.navigate('CreateMission')}
          color={COLORS.primary}
        />

        <QuickActionCard
          icon="people-outline"
          title="Gérer les chauffeurs"
          subtitle={`${stats.totalDrivers} chauffeurs`}
          onPress={() => navigation.navigate('Drivers')}
          color={COLORS.info}
        />

        <QuickActionCard
          icon="car-sport-outline"
          title="Gérer les camions"
          subtitle={`${stats.totalTrucks} camions`}
          onPress={() => navigation.navigate('Trucks')}
          color={COLORS.success}
        />

        <QuickActionCard
          icon="list-outline"
          title="Toutes les missions"
          subtitle={`${stats.pendingMissions} en attente`}
          onPress={() => navigation.navigate('Missions')}
          color={COLORS.warning}
        />

        <QuickActionCard
          icon="water-outline"
          title="Gestion carburant"
          subtitle="Suivi de la consommation"
          onPress={() => navigation.navigate('Fuel')}
          color={COLORS.info}
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
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
  greeting: { fontSize: 16, color: COLORS.textSecondary },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  notificationButton: { position: 'relative' },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  // 🔄 RESET SECTION
  resetSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  resetContent: {
    flex: 1,
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  resetSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  section: { paddingHorizontal: 24, marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: { flex: 1 },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default AdminDashboardScreen;