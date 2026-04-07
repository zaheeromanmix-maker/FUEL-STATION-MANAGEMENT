import { 
  FuelStation, 
  FuelTank, 
  DipChart, 
  DipstickReading, 
  DensityReading, 
  User 
} from '../types';

const STORAGE_KEYS = {
  STATIONS: 'fuel_stations',
  TANKS: 'fuel_tanks',
  DIP_CHARTS: 'fuel_dip_charts',
  DIPSTICK_READINGS: 'fuel_dipstick_readings',
  DENSITY_READINGS: 'fuel_density_readings',
  USERS: 'fuel_users',
  CURRENT_USER: 'fuel_current_user',
};

// Initial Data
const INITIAL_USERS: User[] = [
  { id: 'admin-1', email: 'admin@fuel.com', password: 'admin', role: 'admin' },
  { id: 'user-1', email: 'station1@fuel.com', password: 'user123', role: 'station_user', stationId: 'station-1' },
];

const INITIAL_STATIONS: FuelStation[] = [
  { id: 'station-1', name: 'Main City Station', location: 'Downtown', assignedUserIds: ['user-1'] },
];

const INITIAL_TANKS: FuelTank[] = [
  { id: 'tank-1', stationId: 'station-1', name: 'Tank A', fuelType: 'Petrol', capacity: 10000, maxDip: 200 },
];

const INITIAL_DIP_CHARTS: DipChart[] = [
  { 
    id: 'chart-1', 
    tankId: 'tank-1', 
    points: [
      { cm: 0, litres: 0 },
      { cm: 10, litres: 500 },
      { cm: 20, litres: 1000 },
      { cm: 50, litres: 2500 },
      { cm: 100, litres: 5000 },
      { cm: 150, litres: 7500 },
      { cm: 200, litres: 10000 },
    ] 
  },
];

function get<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
}

function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  // Stations
  getStations: () => get<FuelStation[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS),
  saveStation: (station: FuelStation) => {
    const stations = storage.getStations();
    const index = stations.findIndex(s => s.id === station.id);
    if (index >= 0) stations[index] = station;
    else stations.push(station);
    set(STORAGE_KEYS.STATIONS, stations);
  },
  deleteStation: (id: string) => {
    set(STORAGE_KEYS.STATIONS, storage.getStations().filter(s => s.id !== id));
  },

  // Tanks
  getTanks: () => get<FuelTank[]>(STORAGE_KEYS.TANKS, INITIAL_TANKS),
  saveTank: (tank: FuelTank) => {
    const tanks = storage.getTanks();
    const index = tanks.findIndex(t => t.id === tank.id);
    if (index >= 0) tanks[index] = tank;
    else tanks.push(tank);
    set(STORAGE_KEYS.TANKS, tanks);
  },
  deleteTank: (id: string) => {
    set(STORAGE_KEYS.TANKS, storage.getTanks().filter(t => t.id !== id));
  },

  // Dip Charts
  getDipCharts: () => get<DipChart[]>(STORAGE_KEYS.DIP_CHARTS, INITIAL_DIP_CHARTS),
  saveDipChart: (chart: DipChart) => {
    const charts = storage.getDipCharts();
    const index = charts.findIndex(c => c.tankId === chart.tankId);
    if (index >= 0) charts[index] = chart;
    else charts.push(chart);
    set(STORAGE_KEYS.DIP_CHARTS, charts);
  },

  // Readings
  getDipstickReadings: () => get<DipstickReading[]>(STORAGE_KEYS.DIPSTICK_READINGS, []),
  saveDipstickReading: (reading: DipstickReading) => {
    const readings = storage.getDipstickReadings();
    readings.push(reading);
    set(STORAGE_KEYS.DIPSTICK_READINGS, readings);
  },

  getDensityReadings: () => get<DensityReading[]>(STORAGE_KEYS.DENSITY_READINGS, []),
  saveDensityReading: (reading: DensityReading) => {
    const readings = storage.getDensityReadings();
    readings.push(reading);
    set(STORAGE_KEYS.DENSITY_READINGS, readings);
  },

  // Users
  getUsers: () => get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    set(STORAGE_KEYS.USERS, users);
  },
  deleteUser: (id: string) => {
    set(STORAGE_KEYS.USERS, storage.getUsers().filter(u => u.id !== id));
  },

  // Auth (Mock)
  getCurrentUser: () => get<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),
  setCurrentUser: (user: User | null) => set(STORAGE_KEYS.CURRENT_USER, user),
};
