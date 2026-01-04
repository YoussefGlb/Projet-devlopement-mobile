import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ⬇️ API DJANGO
import {
  getNotifications,
  markNotificationAsRead,
} from '../../services/api';

// =====================================
// COULEURS LOCALES (SAFE)
// =====================================
const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
};

// =====================================
// NOTIFICATIONS SCREEN
// =====================================
export default function NotificationsScreen() {
  // ⬇️ REMPLACE useDriverStore
  const [notifications, setNotifications] = useState([]);

  // =====================================
  // LOAD NOTIFICATIONS FROM API
  // =====================================
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (e) {
        console.error('Notifications load error:', e);
      }
    };

    loadNotifications();
  }, []);

  // =====================================
  // MARK AS READ
  // =====================================
  const markNotificationRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (e) {
      console.error('Mark notification error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {notifications.length === 0 && (
        <Text style={styles.emptyText}>
          Aucune notification pour le moment
        </Text>
      )}

      {notifications.map((n) => (
        <TouchableOpacity
          key={n.id}
          onPress={() => markNotificationRead(n.id)}
          style={[
            styles.card,
            { opacity: n.is_read ? 0.4 : 1 },
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.text}>{n.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// =====================================
// STYLES (INCHANGÉS)
// =====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },

  text: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
