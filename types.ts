export enum RideStatus {
  OPEN = 'ABERTO',
  FULL = 'LOTADO',
  COMPLETED = 'FINALIZADO'
}

export interface Passenger {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Ride {
  id: string;
  driverName: string;
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  totalCost: number; // Valor total da corrida
  capacity: number;
  passengers: Passenger[];
  status: RideStatus;
  description?: string; // Descrição gerada pela IA
  vehicle: string;
}

export interface UserSession {
  id: string;
  name: string;
  isLoggedIn: boolean;
}

export interface GeminiRideResponse {
  rides: {
    driverName: string;
    origin: string;
    destination: string;
    time: string;
    totalCost: number;
    capacity: number;
    vehicle: string;
    description: string;
  }[];
}