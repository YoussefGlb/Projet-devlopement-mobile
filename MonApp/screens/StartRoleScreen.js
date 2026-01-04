import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

const StartRoleScreen = ({ navigation }) => {
  const handleSelectRole = (role) => {
    if (role === 'driver') {
      navigation.replace('DriverApp');
    } else if (role === 'admin') {
      navigation.replace('AdminApp');
    }
  };

  const RoleCard = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={64} color={color} />
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car-sport" size={48} color={COLORS.primary} />
        <Text style={styles.appTitle}>TruckFlow</Text>
        <Text style={styles.appSubtitle}>Gestion de transport</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Qui êtes-vous ?</Text>

        <View style={styles.rolesContainer}>
          <RoleCard
            icon="person-outline"
            title="Chauffeur"
            subtitle="Gérer mes missions"
            onPress={() => handleSelectRole('driver')}
            color={COLORS.info}
          />

          <RoleCard
            icon="business-outline"
            title="Administrateur"
            subtitle="Gérer l'entreprise"
            onPress={() => handleSelectRole('admin')}
            color={COLORS.primary}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sélectionnez votre rôle pour continuer
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default StartRoleScreen;