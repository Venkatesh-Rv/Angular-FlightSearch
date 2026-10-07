import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlightFilterCriteria } from '../../models/flight.model';

@Component({
  selector: 'app-flight-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './flight-filters.component.html',
  styleUrl: './flight-filters.component.css'
})
export class FlightFiltersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() availableAirlines: string[] = [];
  @Input() initialFilters: FlightFilterCriteria = {
    stops: [0, 1, 2],
    airlines: [],
  };
  @Input() totalCount = 0;

  @Output() filterChange = new EventEmitter<FlightFilterCriteria>();
  @Output() reset = new EventEmitter<void>();

  filterForm = new FormGroup({
    maxPrice: new FormControl<number>(1200, { nonNullable: true }),
    sortBy: new FormControl<FlightFilterCriteria['sortBy']>('priceAsc', { nonNullable: true })
  });

  // Selected stop options: 0 (Direct), 1 (1 Stop), 2 (2+ Stops)
  selectedStops: number[] = [0, 1, 2];

  // Selected airlines
  selectedAirlines: string[] = [];

  readonly stopOptions = [
    { value: 0, label: 'Non-stop Direct', badge: 'Direct' },
    { value: 1, label: '1 Stop', badge: '1 Stop' },
    { value: 2, label: '2+ Stops', badge: '2+ Stops' }
  ];

  ngOnInit(): void {
    if (this.initialFilters) {
      this.filterForm.patchValue({
        maxPrice: this.initialFilters.maxPrice,
        sortBy: this.initialFilters.sortBy
      }, { emitEvent: false });
      this.selectedStops = [...this.initialFilters.stops];
      this.selectedAirlines = [...this.initialFilters.airlines];
    }

    // RxJS reactive stream with debounceTime & distinctUntilChanged for smooth slider filtering
    this.filterForm.valueChanges
      .pipe(
        debounceTime(150),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.emitFilterState();
      });
  }

  toggleStop(stopValue: number, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedStops.includes(stopValue)) {
        this.selectedStops = [...this.selectedStops, stopValue];
      }
    } else {
      this.selectedStops = this.selectedStops.filter(s => s !== stopValue);
    }
    this.emitFilterState();
  }

  isStopSelected(stopValue: number): boolean {
    return this.selectedStops.includes(stopValue);
  }

  toggleAirline(airline: string, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedAirlines.includes(airline)) {
        this.selectedAirlines = [...this.selectedAirlines, airline];
      }
    } else {
      this.selectedAirlines = this.selectedAirlines.filter(a => a !== airline);
    }
    this.emitFilterState();
  }

  isAirlineSelected(airline: string): boolean {
    return this.selectedAirlines.includes(airline);
  }

  clearAirlineFilter(): void {
    this.selectedAirlines = [];
    this.emitFilterState();
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filterForm.value.maxPrice && this.filterForm.value.maxPrice < 1200) count++;
    if (this.selectedStops.length < 3) count++;
    if (this.selectedAirlines.length > 0) count += this.selectedAirlines.length;
    return count;
  }

  onReset(): void {
    this.selectedStops = [0, 1, 2];
    this.selectedAirlines = [];
    this.filterForm.setValue({
      maxPrice: 1200,
      sortBy: 'priceAsc'
    });
    this.reset.emit();
    this.emitFilterState();
  }

  private emitFilterState(): void {
    const formVals = this.filterForm.getRawValue();
    const criteria: FlightFilterCriteria = {
      maxPrice: formVals.maxPrice,
      sortBy: formVals.sortBy,
      stops: this.selectedStops,
      airlines: this.selectedAirlines
    };
    this.filterChange.emit(criteria);
  }
}
