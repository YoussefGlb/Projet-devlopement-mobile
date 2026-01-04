import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Administrateur</Text>

      {/* STATS */}
      <View style={styles.row}>
        <StatCard label="Chauffeurs" value="12" />
        <StatCard label="Camions" value="8" />
      </View>

      <View style={styles.row}>
        <StatCard label="Missions actives" value="5" />
        <StatCard label="Missions terminées" value="38" />
      </View>

      {/* SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fonctionnalités</Text>

        <Text style={styles.item}>• Gestion des chauffeurs</Text>
        <Text style={styles.item}>• Gestion des camions</Text>
        <Text style={styles.item}>• Suivi des missions</Text>
        <Text style={styles.item}>• Statistiques globales</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#020617',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    marginTop: 30,
    backgroundColor: '#020617',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 6,
  },
});
