import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createDriver } from '../../services/api';

const COLORS = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#EF4444',
  success: '#22C55E',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  border: '#334155',
};

const CreateDriverScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractualHours, setContractualHours] = useState('40');

  const handleCreate = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }

    try {
      await createDriver({
        name,
        email,
        phone,
        contractual_hours: parseInt(contractualHours) || 40,
        hours_worked: 0,
        is_active: true,
      });
      Alert.alert('Succès', 'Chauffeur créé avec succès');
      navigation.goBack();
    } catch (e) {
      console.error('Create driver error:', e);
      Alert.alert('Erreur', 'Impossible de créer le chauffeur');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Chauffeur</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Nom complet *</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName}
          placeholder="Ahmed Benali"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ahmed@transport.ma"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Téléphone *</Text>
        <TextInput 
          style={styles.input} 
          value={phone} 
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+212 6 12 34 56 78"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Heures contractuelles</Text>
        <TextInput 
          style={styles.input} 
          value={contractualHours} 
          onChangeText={setContractualHours} 
          keyboardType="numeric"
          placeholder="40"
          placeholderTextColor={COLORS.textSecondary}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.text} />
          <Text style={styles.buttonText}>Créer le chauffeur</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  content: { padding: 24 },
  label: { color: COLORS.textSecondary, marginBottom: 8, marginTop: 16, fontSize: 14, fontWeight: '500' },
  input: { 
    backgroundColor: COLORS.card, 
    color: COLORS.text, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    fontSize: 16
  },
  button: { 
    flexDirection: 'row',
    backgroundColor: COLORS.success, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8
  },
  buttonText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
});

export default CreateDriverScreen;