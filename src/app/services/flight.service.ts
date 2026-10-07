import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, of, throwError } from 'rxjs';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import {
  Airport,
  Flight,
  FlightDataResponse,
  FlightFilterCriteria,
  FlightSearchParams
} from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/data/flights.json';

  // State Subjects
  private readonly airportsSubject = new BehaviorSubject<Airport[]>([]);
  private readonly rawFlightsSubject = new BehaviorSubject<Flight[]>([]);
  private readonly searchParamsSubject = new BehaviorSubject<FlightSearchParams | null>(null);
  private readonly filterCriteriaSubject = new BehaviorSubject<FlightFilterCriteria>({
    stops: [0, 1, 2],
    airlines: [],
  });

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private simulateErrorFlag = false;

  // Public Observables
  readonly airports$ = this.airportsSubject.asObservable();
  readonly searchParams$ = this.searchParamsSubject.asObservable();
  readonly filterCriteria$ = this.filterCriteriaSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Filtered Flights stream reactive to search params, filter changes, and raw flight inventory
  readonly flights$: Observable<Flight[]> = combineLatest([
    this.rawFlightsSubject,
    this.searchParamsSubject,
    this.filterCriteriaSubject
  ]).pipe(
    map(([flights, searchParams, filters]) => {
      if (!flights || flights.length === 0) {
        return [];
      }

      // Step 1: Filter by Origin & Destination if search parameters exist
      let results = [...flights];

      if (searchParams) {
        const fromCode = searchParams.from.trim().toUpperCase();
        const toCode = searchParams.to.trim().toUpperCase();

        if (fromCode && toCode) {
          const directOrRouteMatches = results.filter(
            f =>
              (f.origin.code.toUpperCase() === fromCode || f.origin.city.toUpperCase().includes(fromCode)) &&
              (f.destination.code.toUpperCase() === toCode || f.destination.city.toUpperCase().includes(toCode))
          );

          // If there are exact matches, use them; otherwise keep all flights as flexible suggestions
          if (directOrRouteMatches.length > 0) {
            results = directOrRouteMatches;
          }
        }
      }

      // Step 2: Filter by stops
      if (filters.stops && filters.stops.length > 0) {
        results = results.filter(f => filters.stops.includes(f.stops));
      }

      // Step 3: Filter by max price
      // if (filters.maxPrice) {
      //   results = results.filter(f => f.price <= filters.maxPrice);
      // }

      // Step 4: Filter by airline
      if (filters.airlines && filters.airlines.length > 0) {
        results = results.filter(f => filters.airlines.includes(f.airline));
      }

      // Step 5: Sort results
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          case 'durationAsc':
            return a.durationMinutes - b.durationMinutes;
          case 'departureAsc':
            return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
          default:
            return 0;
        }
      });

      return results;
    })
  );

  constructor() {
    this.fetchFlightData();
  }

  /**
   * REST API call via HttpClient to fetch flights & airport catalog
   */
  fetchFlightData(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // If simulated error is enabled for testing
    if (this.simulateErrorFlag) {
      setTimeout(() => {
        this.errorSubject.next('Failed to retrieve flight data from the server. (Simulated REST API Error)');
        this.loadingSubject.next(false);
      }, 600);
      return;
    }

    this.http.get<FlightDataResponse>(this.apiUrl).pipe(
      delay(450), // Realistic network simulation
      tap(response => {
        this.airportsSubject.next(response.airports || []);
        this.rawFlightsSubject.next(response.flights || []);
        this.loadingSubject.next(false);
      }),
      catchError(err => {
        console.error('Error fetching flights:', err);
        const errorMessage =
          err?.status === 404
            ? 'Flight API endpoint not found (404).'
            : 'Unable to connect to flight server. Please check your connection and try again.';
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        return of({ airports: [], flights: [] });
      })
    ).subscribe();
  }

  /**
   * Trigger search with user parameters
   */
  searchFlights(params: FlightSearchParams): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Simulate search latency
    setTimeout(() => {
      this.searchParamsSubject.next(params);
      this.loadingSubject.next(false);
    }, 500);
  }

  /**
   * Update active filter criteria
   */
  updateFilters(criteria: Partial<FlightFilterCriteria>): void {
    const current = this.filterCriteriaSubject.value;
    this.filterCriteriaSubject.next({
      ...current,
      ...criteria
    });
  }

  /**
   * Reset filters to defaults
   */
  resetFilters(): void {
    this.filterCriteriaSubject.next({
      maxPrice: 1500,
      stops: [0, 1, 2],
      airlines: [],
      sortBy: 'priceAsc'
    });
  }

  /**
   * Get single flight by ID for detail page / modal
   */
  getFlightById(id: string): Observable<Flight | undefined> {
    return this.rawFlightsSubject.pipe(
      switchMap(flights => {
        if (flights.length > 0) {
          return of(flights.find(f => f.id === id));
        }
        // If not loaded yet, fetch directly
        return this.http.get<FlightDataResponse>(this.apiUrl).pipe(
          map(res => res.flights.find(f => f.id === id))
        );
      })
    );
  }

  /**
   * Helper to get list of distinct airlines
   */
  getAvailableAirlines(): Observable<string[]> {
    return this.rawFlightsSubject.pipe(
      map(flights => {
        const set = new Set<string>();
        flights.forEach(f => set.add(f.airline));
        return Array.from(set).sort();
      })
    );
  }

  /**
   * Toggle error simulation to showcase requirement: "Display appropriate loading and error messages"
   */
  toggleSimulatedError(state: boolean): void {
    this.simulateErrorFlag = state;
    this.fetchFlightData();
  }

  isSimulatingError(): boolean {
    return this.simulateErrorFlag;
  }
}
