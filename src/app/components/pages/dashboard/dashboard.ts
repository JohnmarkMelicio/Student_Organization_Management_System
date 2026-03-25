import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../services/organization.service';
import { EventsService } from '../../../services/events.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Organization } from '../../../models/organization.model';
import { Event } from '../../../models/event.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  organizationsCount = 0;
  eventsCount = 0;
  attendanceCount = 0;
  membersCount = 0;

  upcomingEvents: Event[] = [];

  user: any;

  constructor(
    private orgService: OrganizationService,
    private eventService: EventsService,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    // 🔥 GET USER FROM FIREBASE
    this.authService.getCurrentUserData().then((data: any) => {
      this.user = data;
    });

    const justLoggedIn = sessionStorage.getItem('justLoggedIn');

    if (justLoggedIn) {

      Swal.fire({
        title: 'Welcome!',
        text: 'You are now in the Dashboard.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      sessionStorage.removeItem('justLoggedIn');
    }

    this.loadStats();
  }

  loadStats(): void {

    this.orgService.getAll().subscribe(res => {
      this.organizationsCount = res.length;
    });

    this.eventService.getAll().subscribe(res => {
      this.eventsCount = res.length;
      this.upcomingEvents = res.slice(0, 3);
    });

    this.attendanceService.getAll().subscribe(res => {
      this.attendanceCount = res.length;
    });

    this.membersCount = 0;
  }
}