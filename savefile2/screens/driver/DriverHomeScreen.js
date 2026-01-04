import { Text, View } from "react-native";
import { useDriverStore } from "../../store/useDriverStore"; // ← CHANGEZ CETTE LIGNE
import { design } from '../../theme/design';



export default function DriverHomeScreen() {
  const missions = useDriverStore((s) => s.missions);
  const current = missions.find((m) => m.status === "EN_COURS");

  if (!current) {
    return (
      <Text style={{ color: design.
colors.text, padding: 20 }}>
        Aucune mission en cours
      </Text>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: design.
colors.background }}>
      <Text style={{ color: design.
colors.text, fontSize: 18 }}>
        {current.from} → {current.to}
      </Text>
      <Text style={{ color: design.
colors.muted }}>
        {current.doneKm} / {current.totalKm} km
      </Text>
      <Text style={{ color: design.
colors.primary }}>
        {current.status}
      </Text>
    </View>
  );
}
