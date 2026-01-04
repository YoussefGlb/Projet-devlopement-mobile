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

import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

// ⬇️ API DJANGO (OPTIONNEL)
import {
  getDrivers,
  getWeeklyStats,
  getNotifications,
} from '../../services/api';

// =====================================
// COULEURS
// =====================================
const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#3B82F6',
  success: '#22C55E',
  error: '#EF4444',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
};

// =====================================
// PROFILE SCREEN
// =====================================
export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();

  // 🔐 Firebase = toujours fiable
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // =====================================
  // LOAD DJANGO DATA (SAFE)
  // =====================================
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        if (!user?.email) return;

        const drivers = await getDrivers();

        const matched = drivers.find((d) => {
          const email =
            d.email ||
            d.user?.email ||
            d.account?.email;

          return (
            email &&
            email.toLowerCase().trim() ===
              user.email.toLowerCase().trim()
          );
        });

        if (!matched) return;

        setDriver(matched);

        const statsRes = await getWeeklyStats(matched.id);
        const notifRes = await getNotifications(matched.id);

        setStats(statsRes || null);
        setNotifications(notifRes || []);
      } catch (e) {
        console.warn('Backend profile skipped');
      }
    };

    loadBackendData();
  }, [user]);

  // =====================================
  // LOGOUT
  // =====================================
const handleLogout = async () => {
  try {
    await signOut(auth);

    // 🔐 on vide le contexte
    setUser(null);

    // 🔁 reset total vers Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (error) {
    console.log('Logout error:', error);
    Alert.alert('Erreur', 'Impossible de se déconnecter');
  }
};


  // =====================================
  // UI
  // =====================================
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.text }}>
          Aucun utilisateur connecté
        </Text>
      </View>
    );
  }

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.headerTitle}>Profil</Text>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.text} />
          </View>

          <Text style={styles.name}>{user.email}</Text>
          <Text style={styles.sub}>UID : {user.uid}</Text>

          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Actif</Text>
          </View>
        </View>

        {/* BACKEND INFO (SI DISPO) */}
        {driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>

            <InfoRow icon="call-outline" label="Téléphone" value={driver.phone || '-'} />
            <InfoRow icon="time-outline" label="Heures contractuelles" value={`${driver.contractual_hours || 0}h`} />
          </View>
        )}

        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cette semaine</Text>

            <Stat value={stats.total_kilometers || 0} label="Kilomètres" />
            <Stat value={stats.total_hours_worked || 0} label="Heures" />
            <Stat value={stats.completed_missions || 0} label="Missions" />
          </View>
        )}

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// =====================================
// COMPONENTS
// =====================================
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Stat = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20 },

  profileCard: { backgroundColor: COLORS.card, padding: 24, borderRadius: 16, alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.textMuted, fontSize: 12 },
  status: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  statusText: { color: COLORS.success },

  section: { marginTop: 24 },
  sectionTitle: { color: COLORS.text, fontWeight: '700', marginBottom: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, padding: 14, borderRadius: 12, marginBottom: 8 },
  infoLabel: { color: COLORS.textSecondary, flex: 1 },
  infoValue: { color: COLORS.text, fontWeight: '600' },

  stat: { backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  statLabel: { color: COLORS.textMuted },

  logout: { marginTop: 32, flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error },
  logoutText: { color: COLORS.error, fontWeight: '700' },
});
