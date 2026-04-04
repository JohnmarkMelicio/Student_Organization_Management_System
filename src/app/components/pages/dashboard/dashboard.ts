import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../services/organization.service';
import { EventsService } from '../../../services/events.service';
import { AttendanceService } from '../../../services/attendance.service';
import { MembersService } from '../../../services/members.service';
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

  upcomingEvents: any[] = [];
  ongoingEvents: any[] = [];
  completedEvents: any[] = [];

  user: any;

  constructor(
    private orgService: OrganizationService,
    private eventService: EventsService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private membersService: MembersService
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

    this.orgService.getAll().subscribe(res => {
      this.organizationsCount = res.length;
    });

    this.eventService.getAll().subscribe((res: any[]) => {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.upcomingEvents = [];
      this.ongoingEvents = [];
      this.completedEvents = [];

      res.forEach(e => {

        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate.getTime() === today.getTime()) {
          this.ongoingEvents.push(e);
        } 
        else if (eventDate > today) {
          this.upcomingEvents.push(e);
        } 
        else {
          this.completedEvents.push(e);
        }

      });

      this.upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.ongoingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.completedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.upcomingEvents = this.upcomingEvents.slice(0, 3);
      this.ongoingEvents = this.ongoingEvents.slice(0, 3);
      this.completedEvents = this.completedEvents.slice(0, 5);

      this.eventsCount = this.upcomingEvents.length;

    });

    this.attendanceService.getAll().subscribe(res => {
      this.attendanceCount = res.length;
    });

    this.membersService.getAll().subscribe(members => {
      this.membersCount = members.length;
    });

  }

  trackByEvent(index: number, item: any) {
    return item.id || index;
  }

}