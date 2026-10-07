export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface FlightBaggage {
  cabin: string;
  checked: string;
}

export interface FareBreakdown {
  baseFare: number;
  taxesAndFees: number;
  serviceFee: number;
  total: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineColor?: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  layoverDetails?: string | null;
  price: number;
  currency: string;
  seatsAvailable: number;
  aircraft: string;
  cabinClass: string;
  baggage: FlightBaggage;
  amenities: string[];
  refundable: boolean;
  fareBreakdown: FareBreakdown;
}

export interface FlightDataResponse {
  airports: Airport[];
  flights: Flight[];
}

export interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string | Date;
  returnDate?: string | Date | null;
  passengers: number;
  tripType?: 'roundTrip' | 'oneWay';
  cabinClass?: string;
}

export interface FlightFilterCriteria {
  maxPrice?: number;
  stops: number[]; // e.g. [0] for direct, [1] for 1 stop, [2] for 2+
  airlines: string[];
  sortBy?: 'priceAsc' | 'priceDesc' | 'durationAsc' | 'departureAsc';
}
