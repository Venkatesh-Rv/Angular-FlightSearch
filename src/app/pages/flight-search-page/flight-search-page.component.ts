import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import {
  Airport,
  Flight,
  FlightFilterCriteria,
  FlightSearchParams
} from '../../models/flight.model';
import { FlightService } from '../../services/flight.service';
import { FlightSearchFormComponent } from '../../components/flight-search-form/flight-search-form.component';
import { FlightFiltersComponent } from '../../components/flight-filters/flight-filters.component';
import { FlightCardComponent } from '../../components/flight-card/flight-card.component';
import { FlightDetailsDialogComponent } from '../../components/flight-details-dialog/flight-details-dialog.component';

@Component({
  selector: 'app-flight-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FlightSearchFormComponent,
    FlightFiltersComponent,
    FlightCardComponent
  ],
  templateUrl: './flight-search-page.component.html',
  styleUrl: './flight-search-page.component.css'
})
export class FlightSearchPageComponent implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly dialog = inject(MatDialog);

  readonly airports$: Observable<Airport[]> = this.flightService.airports$;
  readonly flights$: Observable<Flight[]> = this.flightService.flights$;
  readonly loading$: Observable<boolean> = this.flightService.loading$;
  readonly error$: Observable<string | null> = this.flightService.error$;
  readonly searchParams$: Observable<FlightSearchParams | null> = this.flightService.searchParams$;
  readonly filterCriteria$: Observable<FlightFilterCriteria> = this.flightService.filterCriteria$;
  readonly availableAirlines$: Observable<string[]> = this.flightService.getAvailableAirlines();

  ngOnInit(): void {
    // Initial search with default route (JFK to LHR) so results are populated on first visit
    this.flightService.searchFlights({
      from: 'JFK',
      to: 'LHR',
      departureDate: new Date(2026, 9, 15),
      returnDate: new Date(2026, 9, 22),
      passengers: 1
    });
  }

  onSearch(params: FlightSearchParams): void {
    this.flightService.searchFlights(params);
  }

  onFilterChange(criteria: FlightFilterCriteria): void {
    this.flightService.updateFilters(criteria);
  }

  onResetFilters(): void {
    this.flightService.resetFilters();
  }

  onRetry(): void {
    this.flightService.fetchFlightData();
  }

  openFlightDetails(flight: Flight): void {
    this.dialog.open(FlightDetailsDialogComponent, {
      data: { flight },
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'flight-modal'
    });
  }
}
