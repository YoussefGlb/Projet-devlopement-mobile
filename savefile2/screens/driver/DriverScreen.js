import { Text, View } from "react-native";
import { missions } from "../../data/mockData"; // ← CHANGEZ CETTE LIGNE


export default function DashboardScreen() {
  const finished = missions.filter(m => m.status === "TERMINEE");
  const totalKm = finished.reduce((s, m) => s + m.distance, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de bord</Text>

      <View style={styles.card}>
        <Text style={styles.text}>Cette semaine</Text>
        <Text style={styles.primary}>{totalKm} km parcourus</Text>
        <Text style={styles.primary}>{finished.length * 8} h travaillées</Text>
      </View>
    </View>
  );
}
