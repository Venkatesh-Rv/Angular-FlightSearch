import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Airport, FlightSearchParams } from '../../models/flight.model';

@Component({
  selector: 'app-flight-search-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatTooltipModule
  ],
  templateUrl: './flight-search-form.component.html',
  styleUrl: './flight-search-form.component.css'
})
export class FlightSearchFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() airports: Airport[] = [];
  @Input() loading = false;
  @Output() search = new EventEmitter<FlightSearchParams>();

  searchForm!: FormGroup;

  ngOnInit(): void {
    // Default dates aligned with mock inventory
    const defaultDeparture = new Date(2026, 9, 15); // Oct 15, 2026
    const defaultReturn = new Date(2026, 9, 22); // Oct 22, 2026

    this.searchForm = this.fb.group(
      {
        from: ['JFK', [Validators.required]],
        to: ['LHR', [Validators.required]],
        departureDate: [defaultDeparture, [Validators.required]],
        returnDate: [defaultReturn],
        passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]]
      },
      {
        validators: [this.originDestinationValidator, this.dateRangeValidator]
      }
    );
  }

  // Cross-field validator: Origin != Destination
  private originDestinationValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('from')?.value;
    const to = control.get('to')?.value;
    if (from && to && from === to) {
      return { sameAirport: true };
    }
    return null;
  }

  // Cross-field validator: Return Date >= Departure Date (if provided)
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const departure = control.get('departureDate')?.value;
    const returnDate = control.get('returnDate')?.value;

    if (departure && returnDate) {
      const depTime = new Date(departure).getTime();
      const retTime = new Date(returnDate).getTime();
      if (retTime < depTime) {
        return { returnBeforeDeparture: true };
      }
    }
    return null;
  }

  swapAirports(): void {
    const fromVal = this.searchForm.get('from')?.value;
    const toVal = this.searchForm.get('to')?.value;
    this.searchForm.patchValue({
      from: toVal,
      to: fromVal
    });
    this.searchForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const formValue = this.searchForm.getRawValue();
    const params: FlightSearchParams = {
      from: formValue.from,
      to: formValue.to,
      departureDate: formValue.departureDate,
      returnDate: formValue.returnDate || null,
      passengers: formValue.passengers
    };

    this.search.emit(params);
  }
}
