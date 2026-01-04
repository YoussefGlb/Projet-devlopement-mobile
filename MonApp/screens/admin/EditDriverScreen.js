import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updateDriver } from '../../services/api';

const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#EF4444',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  border: '#334155',
};

const EditDriverScreen = ({ route, navigation }) => {
  const { driverId, driver } = route.params;
  const [name, setName] = useState(driver.name);
  const [phone, setPhone] = useState(driver.phone);
  const [contractualHours, setContractualHours] = useState(driver.contractual_hours.toString());

  const handleSave = async () => {
    try {
      await updateDriver(driverId, {
        ...driver,
        name,
        phone,
        contractual_hours: parseInt(contractualHours),
      });
      Alert.alert('Succès', 'Chauffeur modifié');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de modifier');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Modifier Chauffeur</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Heures contractuelles</Text>
        <TextInput style={styles.input} value={contractualHours} onChangeText={setContractualHours} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  content: { padding: 24 },
  label: { color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.card, color: COLORS.text, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  button: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
});

export default EditDriverScreen;