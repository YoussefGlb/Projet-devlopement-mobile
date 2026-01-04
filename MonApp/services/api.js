// ===============================
// CONFIGURATION API
// ===============================
const API_URL = 'http://192.168.3.50:8000/api';

// ===============================
// HELPER REQUEST
// ===============================
const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ===============================
// MISSIONS
// ===============================
export const getMissions = () => request('/missions/');
export const getMissionById = (id) => request(`/missions/${id}/`);

export const createMission = (data) => {
  /**
   * data attendu :
   * {
   *   driver: number,
   *   truck: number,
   *   departure_city: string,
   *   departure_address: string,
   *   departure_lat: number,
   *   departure_lng: number,
   *   arrival_city: string,
   *   arrival_address: string,
   *   arrival_lat: number,
   *   arrival_lng: number,
   *   pickup_time: string (ISO),
   *   expected_dropoff_time: string (ISO),
   *   container_number: string,
   *   container_type: string,
   *   distance: number (optionnel – backend peut recalculer)
   * }
   */
  return request('/missions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMission = (id, data) =>
  request(`/missions/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteMission = (id) =>
  request(`/missions/${id}/`, {
    method: 'DELETE',
  });

// ===============================
// MISSIONS ACTIONS (DRIVER)
// ===============================
export const startMission = (id) =>
  request(`/missions/${id}/start/`, {
    method: 'POST',
  });

export const completeMission = (id) =>
  request(`/missions/${id}/complete/`, {
    method: 'POST',
  });

// ===============================
// DRIVERS
// ===============================
export const getDrivers = () => request('/drivers/');
export const getDriverById = (id) => request(`/drivers/${id}/`);

export const createDriver = (data) =>
  request('/drivers/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateDriver = (id, data) =>
  request(`/drivers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteDriver = async (id) => {
  try {
    await request(`/drivers/${id}/`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (error) {
    // Si c'est une erreur de parsing JSON, c'est OK (204 No Content)
    if (error.message.includes('JSON')) {
      return { success: true };
    }
    throw error;
  }
};
// ===============================
// TRUCKS
// ===============================
export const getTrucks = () => request('/trucks/');
export const getTruckById = (id) => request(`/trucks/${id}/`);

export const createTruck = (data) => {
  /**
   * data attendu :
   * {
   *   brand: string,
   *   plate: string,
   *   capacity: number,
   *   power: number,
   *   motorization: string,
   *   tank_capacity: number,
   *   avg_consumption: number (L / 100km)
   * }
   */
  return request('/trucks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTruck = (id, data) =>
  request(`/trucks/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTruck = (id) =>
  request(`/trucks/${id}/`, {
    method: 'DELETE',
  });

// ===============================
// FUEL
// ===============================
export const getFuelData = () => request('/fuel/');

export const getFuelByTruck = (truckId) =>
  request(`/fuel/?truck=${truckId}`);

/**
 * payload attendu :
 * {
 *   truck: number,
 *   quantity: number,
 *   price_per_liter: number,
 *   location: string
 * }
 */
export const createFuelEntry = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/fuel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fuel API error:', errorText);
      throw new Error('Fuel API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Fuel create error:', error);
    throw error;
  }
};

// ===============================
// AUTH
// ===============================
export const login = (credentials) =>
  request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const logout = () =>
  request('/auth/logout/', {
    method: 'POST',
  });

// ===============================
// GOOGLE MAPS (UTILS FRONT)
// ===============================

/**
 * Génère une URL Google Maps Directions
 * utilisable côté driver
 */
export const getGoogleMapsItineraryUrl = ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
}) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
};
// Check if truck has enough fuel for mission
export const checkTruckFuel = async (truckId, distance) => {
  try {
    const response = await fetch(`${API_URL}/missions/check_fuel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        truck_id: truckId,
        distance: distance,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check fuel');
    }

    return await response.json();
  } catch (error) {
    console.error('Check fuel error:', error);
    throw error;
  }
};

// Refuel truck and create mission
export const refuelAndCreateMission = async (truckId, refuelAmount, missionData) => {
  try {
    const response = await fetch(`${API_URL}/missions/refuel_and_create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        truck_id: truckId,
        refuel_amount: refuelAmount,
        mission_data: missionData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refuel and create mission');
    }

    return await response.json();
  } catch (error) {
    console.error('Refuel and create error:', error);
    throw error;
  }
};