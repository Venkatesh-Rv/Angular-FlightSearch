import { Routes } from '@angular/router';
import { FlightSearchPageComponent } from './pages/flight-search-page/flight-search-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
  },
  {
    path: 'search',
    component: FlightSearchPageComponent,
    title: 'Flight Search & Booking - SkyQuest'
  },
  {
    path: '**',
    redirectTo: 'search'
  }
];
