import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-flight-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './flight-details-dialog.component.html',
  styleUrl: './flight-details-dialog.component.css'
})
export class FlightDetailsDialogComponent {
  readonly data = inject<{ flight: Flight }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FlightDetailsDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  get flight(): Flight {
    return this.data.flight;
  }

  formatDate(isoString: string): string {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(isoString: string): string {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  bookFlight(): void {
    this.dialogRef.close('booked');
    this.snackBar.open(
      `Flight ${this.flight.flightNumber} successfully selected! Proceeding to passenger check-in.`,
      'Close',
      {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );
  }

  navigateToFullPage(): void {
    this.dialogRef.close();
    this.router.navigate(['/flights', this.flight.id]);
  }
}
