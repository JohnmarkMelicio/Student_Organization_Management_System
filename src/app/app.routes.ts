import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Home } from './components/home/home/home';
import { DashboardComponent } from './components/pages/dashboard/dashboard';
import { OrganizationComponent } from './components/pages/organization/organization';
import { PaymentsComponent } from './components/pages/payments/payments';
import { EventsComponent } from './components/pages/events/events';
import { AttendanceComponent } from './components/pages/attendance/attendance';
import { OrganizationDetailsComponent } from './components/pages/organization-details/organization-details';
import { AdminCreateAccount} from './components/pages/admin-create-account/admin-create-account';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: 'home',
    component: Home,
    children: [

      { path: '', component: DashboardComponent },

      { path: 'dashboard', component: DashboardComponent },

      { path: 'events', component: EventsComponent },

      { path: 'attendance', component: AttendanceComponent },

      { path: 'payments', component: PaymentsComponent },

      { path: 'admin-create-account', component: AdminCreateAccount },
      
      { path: 'organization/:id', component: OrganizationDetailsComponent },

      { path: 'organization', component: OrganizationComponent }

    ]
  }

];