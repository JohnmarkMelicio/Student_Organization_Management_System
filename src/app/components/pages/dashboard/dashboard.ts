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
  completedEvents: Event[] = [];

  user: any;

  constructor(
    private orgService: OrganizationService,
    private eventService: EventsService,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

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

  // ORGANIZATIONS
  this.orgService.getAll().subscribe(res => {
    this.organizationsCount = res.length;
  });

  // EVENTS
  this.eventService.getAll().subscribe((res: any[]) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ COMPLETED EVENTS
    this.completedEvents = res
      .filter(e => {
        const eventDate = new Date(e.date);
        const status = e.status?.toLowerCase();

        return status === 'completed' || eventDate < today;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // ✅ UPCOMING EVENTS (FIXED)
    this.upcomingEvents = res
      .filter(e => {
        const eventDate = new Date(e.date);
        const status = e.status?.toLowerCase();

        return status !== 'completed' && eventDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // ✅ COUNT ONLY UPCOMING (FIX)
    this.eventsCount = this.upcomingEvents.length;

  });

  // ATTENDANCE
  this.attendanceService.getAll().subscribe(res => {
    this.attendanceCount = res.length;
  });

  // MEMBERS (placeholder for now)
  this.membersCount = 0;
}
}