import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Home } from './components/home/home';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Organization } from './components/pages/organization/organization';
import { Attendance } from './components/pages/attendance/attendance';
import { Events } from './components/pages/events/events';
import { Payments } from './components/pages/payments/payments';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home,
    children: [
      { path: '', component: Dashboard },
      { path: 'dashboard', component: Dashboard },
      { path: 'events', component: Events },
      { path: 'organization', component: Organization },
      { path: 'attendance', component: Attendance },
      { path: 'payments', component: Payments },
    ],
  },
];
