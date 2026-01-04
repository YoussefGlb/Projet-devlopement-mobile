import { create } from "zustand";

export const useDriverStore = create((set) => ({
  driver: {
    name: "Mohamed El Amrani",
    hoursWorked: 32,
    hoursContract: 60,
  },

  missions: [
    {
      id: 1,
      from: "Rabat",
      exactFrom: "Zone industrielle Hay Riad",
      to: "Oujda",
      exactTo: "Port d’Oujda",
      pickupTime: "08:30",
      dropoffTime: "18:00",
      totalKm: 500,
      doneKm: 120,
      status: "EN_COURS",
      truck: {
        plate: "12345-A-6",
        engine: "Diesel",
      },
    },
    {
      id: 2,
      from: "Casablanca",
      exactFrom: "Port Casablanca",
      to: "Tanger",
      exactTo: "Port Tanger Med",
      pickupTime: "09:00",
      dropoffTime: "15:00",
      totalKm: 330,
      doneKm: 0,
      status: "EN_ATTENTE",
      truck: {
        plate: "67890-B-2",
        engine: "Diesel",
      },
    },
  ],

  startMission: (id) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id
          ? { ...m, status: "EN_COURS" }
          : m
      ),
    })),

  finishMission: (id) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id
          ? { ...m, status: "TERMINEE" }
          : m
      ),
    })),
}));
