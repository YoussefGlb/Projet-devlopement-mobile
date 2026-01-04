import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  mockDriver,
  mockNotifications,
  mockWeeklyStats,
} from '../../data/mockData';

// =====================================
// COULEURS LOCALES (SAFE)
// =====================================
const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// PROFILE SCREEN
// =====================================
const ProfileScreen = () => {
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Déconnecté',
              'Vous avez été déconnecté avec succès'
            ),
        },
      ]
    );
  };

  const unreadNotifications = mockNotifications.filter(
    (n) => !n.read
  ).length;

  const InfoCard = ({ icon, label, value }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const MenuItem = ({ icon, label, color, badge, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>

      <View style={styles.menuRight}>
        {badge > 0 && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.textMuted}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.text} />
          </View>

          <Text style={styles.userName}>{mockDriver.name}</Text>
          <Text style={styles.userId}>{mockDriver.id}</Text>

          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Actif</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <InfoCard icon="mail-outline" label="Email" value={mockDriver.email} />
          <InfoCard icon="call-outline" label="Téléphone" value={mockDriver.phone} />
          <InfoCard
            icon="time-outline"
            label="Heures contractuelles"
            value={`${mockDriver.contractualHours}h / semaine`}
          />
        </View>

        {/* STATS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>

          <View style={styles.stats}>
            <Text style={styles.statValue}>{mockWeeklyStats.totalKilometers}</Text>
            <Text style={styles.statLabel}>Kilomètres</Text>
          </View>

          <View style={styles.stats}>
            <Text style={styles.statValue}>
              {mockWeeklyStats.totalHoursWorked.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Heures</Text>
          </View>

          <View style={styles.stats}>
            <Text style={styles.statValue}>
              {mockWeeklyStats.completedMissions}
            </Text>
            <Text style={styles.statLabel}>Missions</Text>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>

          <View style={styles.menu}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              color={COLORS.info}
              badge={unreadNotifications}
              onPress={() => Alert.alert('Notifications')}
            />
            <MenuItem
              icon="settings-outline"
              label="Paramètres"
              color={COLORS.primary}
              badge={0}
              onPress={() => Alert.alert('Paramètres')}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Aide & Support"
              color={COLORS.success}
              badge={0}
              onPress={() => Alert.alert('Aide')}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={22}
              color={COLORS.error}
            />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },

  profileCard: {
    backgroundColor: COLORS.card,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  userId: { fontSize: 14, color: COLORS.textMuted },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  statusText: { color: COLORS.success, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: COLORS.primary + '22',
  },
  infoLabel: { fontSize: 12, color: COLORS.textMuted },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },

  stats: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: { fontSize: 12, color: COLORS.textMuted },

  menu: { backgroundColor: COLORS.card, borderRadius: 12 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuBadgeText: { color: COLORS.text, fontSize: 12 },

  logout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '700',
  },
});

export default ProfileScreen;
