import { ScrollView } from "react-native";
import MissionCard from "../../components/MissionCard"; // ← CHANGEZ CETTE LIGNE
import { useDriverStore } from "../../store/useDriverStore"; // ← CHANGEZ CETTE LIGNE


export default function DriverHistoryScreen() {
  const missions = useDriverStore((s) =>
    s.missions.filter((m) => m.status === "TERMINEE")
  );

  return (
    <ScrollView style={{ padding: 20 }}>
      {missions.map((m) => (
        <MissionCard key={m.id} mission={m} />
      ))}
    </ScrollView>
  );
}
