export const mockDriver = {
  id: 'DRV001',
  name: 'Ahmed Benjelloun',
  email: 'ahmed.benjelloun@transport.ma',
  phone: '+212 6 12 34 56 78',
  contractualHours: 40,
  status: 'active',
  avatar: null,
};

export const mockTrucks = [
  {
    id: 'TRK001',
    plate: '12345-أ-67',
    capacity: 25000,
    power: 450,
    motorization: 'Diesel',
    tankCapacity: 400,
    currentFuel: 320,
    fuelPercentage: 80,
    brand: 'Mercedes-Benz Actros',
    status: 'available',
  },
  {
    id: 'TRK002',
    plate: '98765-ب-43',
    capacity: 20000,
    power: 400,
    motorization: 'Diesel',
    tankCapacity: 350,
    currentFuel: 175,
    fuelPercentage: 50,
    brand: 'Volvo FH16',
    status: 'in_mission',
  },
];

export const mockMissions = [
  {
    id: 'MSN001',
    driverId: 'DRV001',
    truckId: 'TRK002',
    status: 'in_progress',
    departureCity: 'Casablanca',
    arrivalCity: 'Tanger',
    departureAddress: 'Port de Casablanca, Zone Industrielle',
    arrivalAddress: 'Port Tanger Med, Zone Franche',
    pickupTime: '2024-12-24T08:00:00',
    expectedDropoffTime: '2024-12-24T14:00:00',
    actualStartTime: '2024-12-24T08:15:00',
    actualEndTime: null,
    distance: 340,
    containerNumber: 'CONT-2024-001',
    containerType: '40 pieds HC',
    estimatedFuelCost: 1870,
    notes: 'Livraison urgente - Conteneur réfrigéré',
  },
  {
    id: 'MSN002',
    driverId: 'DRV001',
    truckId: 'TRK001',
    status: 'pending',
    departureCity: 'Tanger',
    arrivalCity: 'Agadir',
    departureAddress: 'Port Tanger Med, Terminal 2',
    arrivalAddress: 'Port d\'Agadir, Quai Commercial',
    pickupTime: '2024-12-25T06:00:00',
    expectedDropoffTime: '2024-12-25T16:00:00',
    actualStartTime: null,
    actualEndTime: null,
    distance: 620,
    containerNumber: 'CONT-2024-002',
    containerType: '20 pieds Standard',
    estimatedFuelCost: 3410,
    notes: 'Matériel fragile - Conduite prudente requise',
  },
  {
    id: 'MSN003',
    driverId: 'DRV001',
    truckId: 'TRK001',
    status: 'pending',
    departureCity: 'Rabat',
    arrivalCity: 'Marrakech',
    departureAddress: 'Zone Industrielle Technopolis, Rabat',
    arrivalAddress: 'Zone Industrielle Sidi Ghanem, Marrakech',
    pickupTime: '2024-12-26T09:00:00',
    expectedDropoffTime: '2024-12-26T13:00:00',
    actualStartTime: null,
    actualEndTime: null,
    distance: 240,
    containerNumber: 'CONT-2024-003',
    containerType: '40 pieds Standard',
    estimatedFuelCost: 1320,
    notes: 'Marchandise sèche - Aucune précaution particulière',
  },
];

export const mockCompletedMissions = [
  {
    id: 'MSN-HIST-001',
    driverId: 'DRV001',
    truckId: 'TRK001',
    status: 'completed',
    departureCity: 'Casablanca',
    arrivalCity: 'Fès',
    departureAddress: 'Zone Industrielle Ain Sebaa',
    arrivalAddress: 'Zone Industrielle Bensouda',
    pickupTime: '2024-12-20T07:00:00',
    expectedDropoffTime: '2024-12-20T12:00:00',
    actualStartTime: '2024-12-20T07:10:00',
    actualEndTime: '2024-12-20T11:45:00',
    distance: 280,
    containerNumber: 'CONT-2024-H01',
    containerType: '20 pieds HC',
    estimatedFuelCost: 1540,
    actualFuelCost: 1520,
    hoursWorked: 4.58,
  },
  {
    id: 'MSN-HIST-002',
    driverId: 'DRV001',
    truckId: 'TRK002',
    status: 'completed',
    departureCity: 'Rabat',
    arrivalCity: 'Casablanca',
    departureAddress: 'Port de Rabat',
    arrivalAddress: 'Port de Casablanca',
    pickupTime: '2024-12-18T14:00:00',
    expectedDropoffTime: '2024-12-18T16:00:00',
    actualStartTime: '2024-12-18T14:05:00',
    actualEndTime: '2024-12-18T15:50:00',
    distance: 95,
    containerNumber: 'CONT-2024-H02',
    containerType: '40 pieds Standard',
    estimatedFuelCost: 522,
    actualFuelCost: 510,
    hoursWorked: 1.75,
  },
  {
    id: 'MSN-HIST-003',
    driverId: 'DRV001',
    truckId: 'TRK001',
    status: 'completed',
    departureCity: 'Tanger',
    arrivalCity: 'Casablanca',
    departureAddress: 'Port Tanger Med',
    arrivalAddress: 'Zone Logistique Ouled Saleh',
    pickupTime: '2024-12-17T05:00:00',
    expectedDropoffTime: '2024-12-17T11:00:00',
    actualStartTime: '2024-12-17T05:15:00',
    actualEndTime: '2024-12-17T11:20:00',
    distance: 340,
    containerNumber: 'CONT-2024-H03',
    containerType: '20 pieds Standard',
    estimatedFuelCost: 1870,
    actualFuelCost: 1900,
    hoursWorked: 6.08,
  },
  {
    id: 'MSN-HIST-004',
    driverId: 'DRV001',
    truckId: 'TRK002',
    status: 'completed',
    departureCity: 'Agadir',
    arrivalCity: 'Marrakech',
    departureAddress: 'Port d\'Agadir',
    arrivalAddress: 'Zone Industrielle Sidi Ghanem',
    pickupTime: '2024-12-15T08:00:00',
    expectedDropoffTime: '2024-12-15T12:00:00',
    actualStartTime: '2024-12-15T08:20:00',
    actualEndTime: '2024-12-15T12:15:00',
    distance: 235,
    containerNumber: 'CONT-2024-H04',
    containerType: '40 pieds HC',
    estimatedFuelCost: 1292,
    actualFuelCost: 1310,
    hoursWorked: 3.92,
  },
];

export const mockWeeklyStats = {
  weekNumber: 51,
  year: 2024,
  totalKilometers: 950,
  totalHoursWorked: 16.33,
  contractualHours: 40,
  completedMissions: 4,
  averageSpeed: 58,
};

export const mockNotifications = [
  {
    id: 'NOT001',
    type: 'mission_assigned',
    title: 'Nouvelle mission assignée',
    message: 'Une nouvelle mission Tanger → Agadir vous a été assignée',
    timestamp: '2024-12-24T07:30:00',
    read: false,
    missionId: 'MSN002',
  },
  {
    id: 'NOT002',
    type: 'mission_reminder',
    title: 'Rappel de mission',
    message: 'Votre mission vers Tanger commence dans 1 heure',
    timestamp: '2024-12-24T07:00:00',
    read: true,
    missionId: 'MSN001',
  },
  {
    id: 'NOT003',
    type: 'fuel_alert',
    title: 'Niveau de carburant',
    message: 'Le réservoir du camion TRK002 est à 50%',
    timestamp: '2024-12-24T06:00:00',
    read: true,
    truckId: 'TRK002',
  },
];

// Fonctions utilitaires pour manipuler les données
export const getMissionById = (missionId) => {
  return mockMissions.find(m => m.id === missionId) || 
         mockCompletedMissions.find(m => m.id === missionId);
};

export const getTruckById = (truckId) => {
  return mockTrucks.find(t => t.id === truckId);
};

export const getActiveMission = (driverId) => {
  return mockMissions.find(m => m.driverId === driverId && m.status === 'in_progress');
};

export const getPendingMissions = (driverId) => {
  return mockMissions.filter(m => m.driverId === driverId && m.status === 'pending');
};

export const getCompletedMissions = (driverId) => {
  return mockCompletedMissions.filter(m => m.driverId === driverId);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('fr-FR', options);
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min`;
};