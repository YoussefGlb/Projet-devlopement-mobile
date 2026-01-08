import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// API
import { createTruck } from '../../services/api';

// =====================================
// COULEURS
// =====================================
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

// =====================================
// ADD TRUCK SCREEN
// =====================================
const AddTruckScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    brand: '',
    plate: '',
    capacity: '',
    power: '',
    motorization: 'Diesel',
    tank_capacity: '',
    current_fuel: '',
    avg_consumption: '',
  });

  const [loading, setLoading] = useState(false);

  // =====================================
  // MOTORIZATION OPTIONS
  // =====================================
  const motorizations = ['Diesel', 'Électrique', 'Hybride'];

  const handleMotorizationSelect = () => {
    Alert.alert(
      'Sélectionner la motorisation',
      '',
      motorizations.map((motor) => ({
        text: motor,
        onPress: () => setFormData((prev) => ({ ...prev, motorization: motor })),
      }))
    );
  };

  // =====================================
  // VALIDATION
  // =====================================
  const validateForm = () => {
    if (!formData.brand.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer la marque du camion');
      return false;
    }

    if (!formData.plate.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer la plaque d\'immatriculation');
      return false;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une capacité valide');
      return false;
    }

    if (!formData.power || Number(formData.power) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une puissance valide');
      return false;
    }

    if (!formData.tank_capacity || Number(formData.tank_capacity) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une capacité de réservoir valide');
      return false;
    }

    if (!formData.current_fuel || Number(formData.current_fuel) < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un niveau de carburant valide');
      return false;
    }

    if (Number(formData.current_fuel) > Number(formData.tank_capacity)) {
      Alert.alert('Erreur', 'Le carburant actuel ne peut pas dépasser la capacité du réservoir');
      return false;
    }

    if (!formData.avg_consumption || Number(formData.avg_consumption) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une consommation moyenne valide');
      return false;
    }

    return true;
  };

  // =====================================
  // HANDLE SUBMIT
  // =====================================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        brand: formData.brand.trim(),
        plate: formData.plate.trim().toUpperCase(),
        capacity: Number(formData.capacity),
        power: Number(formData.power),
        motorization: formData.motorization,
        tank_capacity: Number(formData.tank_capacity),
        current_fuel: Number(formData.current_fuel),
        avg_consumption: Number(formData.avg_consumption),
        is_available: true,
      };

      await createTruck(payload);

      Alert.alert('Succès', 'Camion ajouté avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Create truck error:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le camion. Vérifiez les données.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RENDER
  // =====================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Ajouter un camion</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* INFORMATIONS GÉNÉRALES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Marque <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, brand: text }))
                }
                placeholder="Ex: Mercedes, Volvo, Scania"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Plaque d'immatriculation <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.plate}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, plate: text }))
                }
                placeholder="Ex: 12345-A-67"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* CARACTÉRISTIQUES TECHNIQUES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Caractéristiques techniques</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Capacité de charge (kg) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.capacity}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, capacity: text }))
                }
                placeholder="Ex: 25000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Puissance (CV) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.power}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, power: text }))
                }
                placeholder="Ex: 450"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Motorisation <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={handleMotorizationSelect}
              >
                <Text style={styles.selectButtonText}>
                  {formData.motorization}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* CARBURANT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carburant</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Capacité du réservoir (L) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.tank_capacity}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tank_capacity: text }))
                }
                placeholder="Ex: 500"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Carburant actuel (L) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.current_fuel}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, current_fuel: text }))
                }
                placeholder="Ex: 500"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Consommation moyenne (L/100km){' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.avg_consumption}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, avg_consumption: text }))
                }
                placeholder="Ex: 25"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Ajout en cours...' : 'Ajouter le camion'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default AddTruckScreen;