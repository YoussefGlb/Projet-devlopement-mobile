import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

// 🌐 API
import {
  getDrivers,
  getTrucks,
  createMission,
  getMissions,
  checkTruckFuel,      // ✅ ADD THIS
  refuelAndCreateMission,
} from '../../services/api';

// =====================================
// 🔑 GOOGLE MAPS API KEY
// =====================================
const GOOGLE_MAPS_API_KEY = 'AIzaSyDnnpuAgBvalPKEIRehlhWLHnK-ZhwSekQ';

// =====================================
// COULEURS LOCALES (SAFE)
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
// 🗺️ GOOGLE MAPS GEOCODING
// =====================================
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: data.results[0].formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return '';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return '';
  }
};

const calculateDistance = async (origin, destination) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value;
      return Math.round(distanceInMeters / 1000);
    }
    return 0;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return 0;
  }
};

// =====================================
// HELPER FUNCTIONS
// =====================================
const isNearMultiple1600 = (distanceKm) => {
  return [1600, 2400, 3200, 4800].some((n) => Math.abs(distanceKm - n) < 250);
};

const estimateWorkHours = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return 0;

  const drivingHours = distanceKm / 60;
  const restBreaks = Math.floor(distanceKm / 300) * 0.5;

  let nightRest = 0;
  if (distanceKm > 800) {
    if (!isNearMultiple1600(distanceKm)) {
      nightRest = 8;
    }
  }

  const loading = 80 / 60;
  return drivingHours + restBreaks + nightRest + loading;
};

// =====================================
// CREATE MISSION SCREEN (ADMIN)
// =====================================
const CreateMissionScreen = ({ navigation }) => {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [allMissions, setAllMissions] = useState([]);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapTarget, setMapTarget] = useState(null);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDropoffPicker, setShowDropoffPicker] = useState(false);
  const [pickupDate, setPickupDate] = useState(new Date());
  const [dropoffDate, setDropoffDate] = useState(new Date(Date.now() + 3600000 * 8));

  const [departureCityValue, setDepartureCityValue] = useState('');
  const [departureAddressValue, setDepartureAddressValue] = useState('');
  const [arrivalCityValue, setArrivalCityValue] = useState('');
  const [arrivalAddressValue, setArrivalAddressValue] = useState('');
  const [containerNumberValue, setContainerNumberValue] = useState('');

  const [formData, setFormData] = useState({
    departureLat: null,
    departureLng: null,
    arrivalLat: null,
    arrivalLng: null,
    distance: '',
    containerType: '',
    selectedDriver: null,
    selectedTruck: null,
  });

  // =====================================
  // LOAD DATA
  // =====================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [driversData, trucksData, missionsData] = await Promise.all([
          getDrivers(),
          getTrucks(),
          getMissions(),
        ]);
        setDrivers(driversData);
        setTrucks(trucksData);
        setAllMissions(missionsData);
      } catch (e) {
        console.error('CreateMission load error:', e);
      }
    };
    loadData();
  }, []);

  // =====================================
  // VALIDATION: CHECK DRIVER HOURS
  // =====================================
  const checkDriverAvailability = (driver, newMissionHours) => {
    if (!driver) return { available: false, message: 'Aucun chauffeur sélectionné' };

    // Trouver toutes les missions pending du driver
    const driverPendingMissions = allMissions.filter(
      (m) =>
        m.status === 'pending' &&
        m.driver &&
        (m.driver.id === driver.id || m.driver.name === driver.name)
    );

    // Calculer total des heures pending
    let totalPendingHours = 0;
    driverPendingMissions.forEach((mission) => {
      const missionHours = estimateWorkHours(mission.distance);
      totalPendingHours += missionHours;
    });

    // Heures déjà travaillées
    const hoursWorked = driver.hours_worked || 0;

    // Total après ajout de cette mission
    const totalAfterNewMission = hoursWorked + totalPendingHours + newMissionHours;

    // Heures contractuelles
    const contractualHours = driver.contractual_hours || 40;

    // Heures restantes
    const remainingHours = contractualHours - hoursWorked - totalPendingHours;

    if (totalAfterNewMission > contractualHours) {
      return {
        available: false,
        message: `❌ ${driver.name} dépasserait ses heures contractuelles !

📊 Détails:
• Heures contractuelles: ${contractualHours}h
• Heures déjà travaillées: ${hoursWorked.toFixed(1)}h
• Missions pending: ${totalPendingHours.toFixed(1)}h
• Cette mission: ${newMissionHours.toFixed(1)}h
• Total: ${totalAfterNewMission.toFixed(1)}h

⚠️ Heures disponibles: ${remainingHours.toFixed(1)}h`,
        remainingHours,
      };
    }

    return {
      available: true,
      message: `✅ ${driver.name} peut accepter cette mission

📊 Résumé:
• Heures contractuelles: ${contractualHours}h
• Heures travaillées: ${hoursWorked.toFixed(1)}h
• Missions pending: ${totalPendingHours.toFixed(1)}h
• Cette mission: ${newMissionHours.toFixed(1)}h
• Total après: ${totalAfterNewMission.toFixed(1)}h
• Heures restantes: ${(contractualHours - totalAfterNewMission).toFixed(1)}h`,
      remainingHours,
    };
  };

  // =====================================
  // VALIDATION: CHECK TRUCK AVAILABILITY
  // =====================================
// =====================================
// VALIDATION: CHECK TRUCK AVAILABILITY
// =====================================
  const checkTruckAvailability = (truck, newPickupTime, newDropoffTime) => {
    if (!truck) return { available: false, message: 'Aucun camion sélectionné' };

    const newStart = new Date(newPickupTime);
    const newEnd = new Date(newDropoffTime);

    // Trouver missions conflictuelles
    const conflictingMissions = allMissions.filter((m) => {
      if (m.status === 'completed' || m.status === 'cancelled') return false;
      if (!m.truck) return false;
      
      // ✅ VÉRIFICATION CORRECTE DU TRUCK
      const truckMatch = m.truck.id === truck.id || m.truck.plate === truck.plate;
      if (!truckMatch) return false;

      const missionStart = new Date(m.pickup_time);
      const missionEnd = new Date(m.expected_dropoff_time);

      // ✅ LOGIQUE DE CHEVAUCHEMENT CORRIGÉE
      // Deux périodes se chevauchent si:
      // - La nouvelle commence AVANT la fin de l'existante
      // ET
      // - La nouvelle finit APRÈS le début de l'existante
      return newStart < missionEnd && newEnd > missionStart;
    });

    if (conflictingMissions.length > 0) {
      const conflictDetails = conflictingMissions
        .map((m) => {
          const start = new Date(m.pickup_time).toLocaleString('fr-FR');
          const end = new Date(m.expected_dropoff_time).toLocaleString('fr-FR');
          return `• Mission #${m.id}: ${start} → ${end}`;
        })
        .join('\n');

      return {
        available: false,
        message: `❌ Le camion ${truck.brand} (${truck.plate}) est déjà réservé !

  📅 Conflits détectés:
  ${conflictDetails}

  ⚠️ Choisissez un autre camion ou ajustez les horaires.`,
      };
    }

    return {
      available: true,
      message: `✅ Camion ${truck.brand} (${truck.plate}) disponible`,
    };
  };

  // =====================================
  // GEOCODE ADDRESS
  // =====================================
  const handleAddressBlur = async (type) => {
    const address = type === 'departure' ? departureAddressValue : arrivalAddressValue;
    if (!address.trim()) return;

    setIsGeocoding(true);
    const result = await geocodeAddress(address);
    setIsGeocoding(false);

    if (result) {
      if (type === 'departure') {
        setDepartureAddressValue(result.formattedAddress);
        setFormData((prev) => ({
          ...prev,
          departureLat: result.latitude,
          departureLng: result.longitude,
        }));

        if (formData.arrivalLat && formData.arrivalLng) {
          const distance = await calculateDistance(
            { latitude: result.latitude, longitude: result.longitude },
            { latitude: formData.arrivalLat, longitude: formData.arrivalLng }
          );
          setFormData((prev) => ({ ...prev, distance: distance.toString() }));
        }
      } else {
        setArrivalAddressValue(result.formattedAddress);
        setFormData((prev) => ({
          ...prev,
          arrivalLat: result.latitude,
          arrivalLng: result.longitude,
        }));

        if (formData.departureLat && formData.departureLng) {
          const distance = await calculateDistance(
            { latitude: formData.departureLat, longitude: formData.departureLng },
            { latitude: result.latitude, longitude: result.longitude }
          );
          setFormData((prev) => ({ ...prev, distance: distance.toString() }));
        }
      }

      Alert.alert('Succès', 'Adresse trouvée et coordonnées ajoutées');
    } else {
      Alert.alert('Erreur', 'Impossible de trouver cette adresse');
    }
  };

  // =====================================
  // MAP FUNCTIONS
  // =====================================
  const openMap = async (target) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée');
      return;
    }

    let initialLocation;

    if (target === 'departure' && formData.departureLat && formData.departureLng) {
      initialLocation = { latitude: formData.departureLat, longitude: formData.departureLng };
    } else if (target === 'arrival' && formData.arrivalLat && formData.arrivalLng) {
      initialLocation = { latitude: formData.arrivalLat, longitude: formData.arrivalLng };
    } else {
      const location = await Location.getCurrentPositionAsync({});
      initialLocation = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    }

    setPickedLocation(initialLocation);
    setMapTarget(target);
    setMapVisible(true);
  };

  const confirmLocation = async () => {
    if (!pickedLocation) return;

    const address = await reverseGeocode(pickedLocation.latitude, pickedLocation.longitude);

    if (mapTarget === 'departure') {
      setDepartureAddressValue(address);
      setFormData((prev) => ({
        ...prev,
        departureLat: pickedLocation.latitude,
        departureLng: pickedLocation.longitude,
      }));

      if (formData.arrivalLat && formData.arrivalLng) {
        const distance = await calculateDistance(pickedLocation, {
          latitude: formData.arrivalLat,
          longitude: formData.arrivalLng,
        });
        setFormData((prev) => ({ ...prev, distance: distance.toString() }));
      }
    }

    if (mapTarget === 'arrival') {
      setArrivalAddressValue(address);
      setFormData((prev) => ({
        ...prev,
        arrivalLat: pickedLocation.latitude,
        arrivalLng: pickedLocation.longitude,
      }));

      if (formData.departureLat && formData.departureLng) {
        const distance = await calculateDistance(
          { latitude: formData.departureLat, longitude: formData.departureLng },
          pickedLocation
        );
        setFormData((prev) => ({ ...prev, distance: distance.toString() }));
      }
    }

    setMapVisible(false);
  };

  // =====================================
  // DATE PICKER HANDLERS
  // =====================================
  const onPickupChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPickupPicker(false);
    if (selectedDate) setPickupDate(selectedDate);
  };

  const onDropoffChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDropoffPicker(false);
    if (selectedDate) setDropoffDate(selectedDate);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // =====================================
  // CREATE MISSION WITH VALIDATION
  // =====================================
  const handleCreate = async () => {
  if (
    !departureCityValue.trim() ||
    !arrivalCityValue.trim() ||
    !formData.selectedDriver ||
    !formData.selectedTruck
  ) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
    return;
  }

  const estimatedHours = estimateWorkHours(Number(formData.distance) || 0);

  // ✅ VALIDATION 1: Vérifier les heures du chauffeur
  const driverCheck = checkDriverAvailability(formData.selectedDriver, estimatedHours);
  if (!driverCheck.available) {
    Alert.alert('⚠️ Chauffeur indisponible', driverCheck.message);
    return;
  }

  // ✅ VALIDATION 2: Vérifier disponibilité du camion
  const truckCheck = checkTruckAvailability(formData.selectedTruck, pickupDate, dropoffDate);
  if (!truckCheck.available) {
    Alert.alert('⚠️ Camion indisponible', truckCheck.message);
    return;
  }

  // ✅ VALIDATION 3: Vérifier le carburant
  try {
    console.log('🔍 Checking fuel for truck:', formData.selectedTruck.id);
    console.log('🔍 Distance:', Number(formData.distance));
    
    const fuelCheckResponse = await checkTruckFuel(
      formData.selectedTruck.id,
      Number(formData.distance) || 0
    );

    console.log('🔍 Fuel check response:', JSON.stringify(fuelCheckResponse, null, 2));

    const { fuel_check } = fuelCheckResponse;

    // ✅ DEBUG LOG
    console.log('⛽ Fuel check details:');
    console.log('  - Enough:', fuel_check.enough);
    console.log('  - Current fuel:', fuel_check.current_fuel);
    console.log('  - Needed:', fuel_check.needed);
    console.log('  - Missing:', fuel_check.missing);

    // ⛽ CHECK IF FUEL IS INSUFFICIENT
    if (!fuel_check.enough) {
      console.log('❌ NOT ENOUGH FUEL - Showing options');
      
      const fullTankAmount = formData.selectedTruck.tank_capacity - fuel_check.current_fuel;
      
      Alert.alert(
        '⛽ Carburant insuffisant',
        `Le camion ${formData.selectedTruck.brand} (${formData.selectedTruck.plate}) n'a pas assez de carburant !

📊 Détails:
- Carburant actuel: ${fuel_check.current_fuel.toFixed(1)}L
- Carburant nécessaire: ${fuel_check.needed.toFixed(1)}L
- Manque: ${fuel_check.missing.toFixed(1)}L
- Capacité du réservoir: ${formData.selectedTruck.tank_capacity}L

💰 Options de ravitaillement:`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: `Faire le plein (${fullTankAmount.toFixed(0)}L = ${fuel_check.full_tank_cost.toFixed(0)} DH)`,
            onPress: () => handleRefuelAndCreate('full', fuel_check),
          },
          {
            text: `Ajouter ${fuel_check.missing.toFixed(0)}L (${fuel_check.refuel_cost.toFixed(0)} DH)`,
            onPress: () => handleRefuelAndCreate('needed', fuel_check),
          },
        ]
      );
      return;
    }

    // ✅ ASSEZ DE CARBURANT - CONTINUER NORMALEMENT
    console.log('✅ ENOUGH FUEL - Proceeding to final confirmation');
    showFinalConfirmation(driverCheck, truckCheck, fuel_check);

  } catch (error) {
    console.error('❌ Fuel check error:', error);
    Alert.alert('Erreur', `Impossible de vérifier le carburant du camion: ${error.message}`);
  }
};

// ✅ ADD THIS: Show final confirmation when fuel is sufficient
const showFinalConfirmation = (driverCheck, truckCheck, fuelCheck) => {
  Alert.alert(
    '✅ Validation réussie',
    `${driverCheck.message}

${truckCheck.message}

⛽ Carburant: ${fuelCheck.current_fuel.toFixed(1)}L disponibles
   (${fuelCheck.needed.toFixed(1)}L nécessaires)

Créer la mission ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Créer',
        onPress: () => createMissionNow(),
      },
    ]
  );
};

// ✅ ADD THIS: Create mission without refueling
const createMissionNow = async () => {
  try {
    const payload = {
      driver_id: formData.selectedDriver.id,
      truck_id: formData.selectedTruck.id,
      departure_city: departureCityValue.trim(),
      departure_address: departureAddressValue.trim(),
      departure_lat: formData.departureLat,
      departure_lng: formData.departureLng,
      arrival_city: arrivalCityValue.trim(),
      arrival_address: arrivalAddressValue.trim(),
      arrival_lat: formData.arrivalLat,
      arrival_lng: formData.arrivalLng,
      pickup_time: pickupDate.toISOString(),
      expected_dropoff_time: dropoffDate.toISOString(),
      container_number: containerNumberValue || 'N/A',
      container_type: formData.containerType || '40ft',
      distance: Number(formData.distance) || 0,
      estimated_fuel_cost: 0,
      status: 'pending',
    };

    await createMission(payload);

    Alert.alert('🎉 Succès', 'Mission créée avec succès !', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (e) {
    console.error('Create mission error:', e);
    Alert.alert('❌ Erreur', 'Impossible de créer la mission. Vérifiez les données.');
  }
};

// ✅ ADD THIS: Refuel and create mission
const handleRefuelAndCreate = async (refuelType, fuelCheck) => {
  try {
    const truck = formData.selectedTruck;
    const refuelAmount = refuelType === 'full' 
      ? truck.tank_capacity - fuelCheck.current_fuel
      : fuelCheck.missing;

    const payload = {
      driver_id: formData.selectedDriver.id,
      truck_id: truck.id,
      departure_city: departureCityValue.trim(),
      departure_address: departureAddressValue.trim(),
      departure_lat: formData.departureLat,
      departure_lng: formData.departureLng,
      arrival_city: arrivalCityValue.trim(),
      arrival_address: arrivalAddressValue.trim(),
      arrival_lat: formData.arrivalLat,
      arrival_lng: formData.arrivalLng,
      pickup_time: pickupDate.toISOString(),
      expected_dropoff_time: dropoffDate.toISOString(),
      container_number: containerNumberValue || 'N/A',
      container_type: formData.containerType || '40ft',
      distance: Number(formData.distance) || 0,
      estimated_fuel_cost: 0,
      status: 'pending',
    };

    const result = await refuelAndCreateMission(truck.id, refuelAmount, payload);

    Alert.alert(
      '🎉 Succès',
      `Mission créée avec succès !

⛽ Ravitaillement effectué:
- Quantité ajoutée: ${result.refuel_amount.toFixed(1)}L
- Coût: ${result.refuel_cost.toFixed(0)} DH
- Nouveau niveau: ${result.truck.current_fuel.toFixed(1)}L / ${truck.tank_capacity}L`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (e) {
    console.error('Refuel and create error:', e);
    Alert.alert('❌ Erreur', 'Impossible de ravitailler et créer la mission.');
  }
};

  // =====================================
  // DRIVER/TRUCK SELECT
  // =====================================
  const handleSelectDriver = () => {
    Alert.alert(
      'Sélectionner un chauffeur',
      '',
      drivers.map((driver) => ({
        text: driver.name,
        onPress: () => setFormData((prev) => ({ ...prev, selectedDriver: driver })),
      }))
    );
  };

  const handleSelectTruck = () => {
    Alert.alert(
      'Sélectionner un camion',
      '',
      trucks.map((truck) => ({
        text: `${truck.brand} - ${truck.plate}`,
        onPress: () => setFormData((prev) => ({ ...prev, selectedTruck: truck })),
      }))
    );
  };

  // =====================================
  // RENDER
  // =====================================
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Mission</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="always">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Itinéraire</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Ville de départ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={departureCityValue}
              onChangeText={setDepartureCityValue}
              placeholder="Ex: Casablanca"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Adresse de départ</Text>
            <TextInput
              style={styles.input}
              value={departureAddressValue}
              onChangeText={setDepartureAddressValue}
              onBlur={() => handleAddressBlur('departure')}
              placeholder="Ex: 123 Rue Mohammed V"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={() => openMap('departure')}>
            <Ionicons name="map" size={18} color={COLORS.info} />
            <Text style={styles.mapButtonText}>
              {formData.departureLat ? '📍 Modifier sur la carte' : '📍 Choisir sur la carte'}
            </Text>
          </TouchableOpacity>

          {formData.departureLat && (
            <Text style={styles.coordinatesText}>
              ✓ Coordonnées: {formData.departureLat.toFixed(4)}, {formData.departureLng.toFixed(4)}
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Ville d'arrivée <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={arrivalCityValue}
              onChangeText={setArrivalCityValue}
              placeholder="Ex: Rabat"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Adresse d'arrivée</Text>
            <TextInput
              style={styles.input}
              value={arrivalAddressValue}
              onChangeText={setArrivalAddressValue}
              onBlur={() => handleAddressBlur('arrival')}
              placeholder="Ex: 456 Avenue Hassan II"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={() => openMap('arrival')}>
            <Ionicons name="map" size={18} color={COLORS.info} />
            <Text style={styles.mapButtonText}>
              {formData.arrivalLat ? '📍 Modifier sur la carte' : '📍 Choisir sur la carte'}
            </Text>
          </TouchableOpacity>

          {formData.arrivalLat && (
            <Text style={styles.coordinatesText}>
              ✓ Coordonnées: {formData.arrivalLat.toFixed(4)}, {formData.arrivalLng.toFixed(4)}
            </Text>
          )}

          {formData.distance && (
            <View style={styles.distanceCard}>
              <Ionicons name="speedometer" size={20} color={COLORS.success} />
              <Text style={styles.distanceText}>Distance calculée: {formData.distance} km</Text>
            </View>
          )}

          {formData.distance && formData.distance > 0 && (
            <View style={styles.estimationBox}>
              <View style={styles.estimationHeader}>
                <Ionicons name="time" size={20} color={COLORS.info} />
                <Text style={styles.estimationLabel}>
                  Durée estimée: {estimateWorkHours(formData.distance).toFixed(1)}h
                </Text>
              </View>
              <Text style={styles.estimationHint}>
                💡 Ajustez l'heure d'arrivée selon votre planning
              </Text>
              <View style={styles.estimationDetails}>
                <Text style={styles.estimationDetail}>
                  • Conduite: {(formData.distance / 60).toFixed(1)}h
                </Text>
                <Text style={styles.estimationDetail}>
                  • Repos: {(Math.floor(formData.distance / 300) * 0.5).toFixed(1)}h
                </Text>
                {formData.distance > 800 && !isNearMultiple1600(formData.distance) && (
                  <Text style={styles.estimationDetail}>• Repos nuit: 8.0h</Text>
                )}
                <Text style={styles.estimationDetail}>• Chargement: 1.3h</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Horaires</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Heure de ramassage <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPickupPicker(true)}>
              <Ionicons name="calendar" size={20} color={COLORS.info} />
              <Text style={styles.dateButtonText}>{formatDate(pickupDate)}</Text>
            </TouchableOpacity>
          </View>

          {showPickupPicker && (
            <DateTimePicker
              value={pickupDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickupChange}
              locale="fr-FR"
            />
          )}

          {Platform.OS === 'ios' && showPickupPicker && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowPickupPicker(false)}>
              <Text style={styles.doneButtonText}>Confirmer</Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Heure de livraison prévue <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDropoffPicker(true)}>
              <Ionicons name="calendar" size={20} color={COLORS.info} />
              <Text style={styles.dateButtonText}>{formatDate(dropoffDate)}</Text>
            </TouchableOpacity>
          </View>

          {showDropoffPicker && (
            <DateTimePicker
              value={dropoffDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDropoffChange}
              locale="fr-FR"
            />
          )}

          {Platform.OS === 'ios' && showDropoffPicker && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowDropoffPicker(false)}>
              <Text style={styles.doneButtonText}>Confirmer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Assignation</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Chauffeur <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.selectButton} onPress={handleSelectDriver}>
              <Text
                style={
                  formData.selectedDriver ? styles.selectButtonTextActive : styles.selectButtonText
                }
              >
                {formData.selectedDriver?.name || 'Sélectionner chauffeur'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Camion <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.selectButton} onPress={handleSelectTruck}>
              <Text
                style={
                  formData.selectedTruck ? styles.selectButtonTextActive : styles.selectButtonText
                }
              >
                {formData.selectedTruck
                  ? `${formData.selectedTruck.brand} - ${formData.selectedTruck.plate}`
                  : 'Sélectionner camion'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Conteneur</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Numéro de conteneur</Text>
            <TextInput
              style={styles.input}
              value={containerNumberValue}
              onChangeText={setContainerNumberValue}placeholder="Ex: CONT123456"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Type de conteneur</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() =>
                Alert.alert('Type de conteneur', '', [
                  {
                    text: '20ft',
                    onPress: () => setFormData((p) => ({ ...p, containerType: '20ft' })),
                  },
                  {
                    text: '40ft',
                    onPress: () => setFormData((p) => ({ ...p, containerType: '40ft' })),
                  },
                  {
                    text: '40ft HC',
                    onPress: () => setFormData((p) => ({ ...p, containerType: '40ft HC' })),
                  },
                ])
              }
            >
              <Text
                style={
                  formData.containerType ? styles.selectButtonTextActive : styles.selectButtonText
                }
              >
                {formData.containerType || 'Sélectionner type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MAP MODAL */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: pickedLocation?.latitude || 33.5731,
              longitude: pickedLocation?.longitude || -7.5898,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => setPickedLocation(e.nativeEvent.coordinate)}
          >
            {pickedLocation && <Marker coordinate={pickedLocation} />}
          </MapView>

          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapCancelButton} onPress={() => setMapVisible(false)}>
              <Text style={styles.mapCancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapConfirmButton} onPress={confirmLocation}>
              <Ionicons name="checkmark" size={20} color={COLORS.text} />
              <Text style={styles.mapConfirmText}>Confirmer la position</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM BUTTONS */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          disabled={isGeocoding}
        >
          <Text style={styles.createButtonText}>
            {isGeocoding ? 'Géocodage...' : 'Créer la mission'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  content: { flex: 1 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  required: { color: COLORS.primary },
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButtonText: { color: COLORS.textMuted },
  selectButtonTextActive: { color: COLORS.text },
  dateButton: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  doneButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  doneButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  mapButton: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  mapButtonText: { color: COLORS.info, fontWeight: '600', fontSize: 15 },
  coordinatesText: { fontSize: 13, color: COLORS.success, marginBottom: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  distanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  distanceText: { fontSize: 16, fontWeight: '600', color: COLORS.success },
  estimationBox: {
    backgroundColor: COLORS.info + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  estimationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  estimationLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.info,
  },
  estimationHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  estimationDetails: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  estimationDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapContainer: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },
  mapControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mapCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  mapCancelText: { fontWeight: '700', color: COLORS.text },
  mapConfirmButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapConfirmText: { fontWeight: '700', color: COLORS.text, fontSize: 16 },
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
  cancelButtonText: { fontWeight: '700', color: COLORS.text },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  createButtonText: { fontWeight: '700', color: COLORS.text },
});

export default CreateMissionScreen;