import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.css'
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;
  @Output() viewDetails = new EventEmitter<Flight>();

  onViewDetails(): void {
    this.viewDetails.emit(this.flight);
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isNextDay(depIso: string, arrIso: string): boolean {
    const dep = new Date(depIso);
    const arr = new Date(arrIso);
    return arr.getDate() !== dep.getDate();
  }

  getLayoverCity(layover?: string | null): string {
    if (!layover) return 'Layover';
    const parts = layover.split(' in ');
    if (parts.length > 1) {
      return parts[1].replace(')', '');
    }
    return 'Layover';
  }
}
