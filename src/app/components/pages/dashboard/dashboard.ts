import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// 🔥 PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ChartModule } from 'primeng/chart';

// Services
import { OrganizationService } from '../../../services/organization.service';
import { EventsService } from '../../../services/events.service';
import { AttendanceService } from '../../../services/attendance.service';
import { MembersService } from '../../../services/members.service';
import { AuthService } from '../../../services/auth.service';

// Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    TimelineModule,
    ChartModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  organizationsCount = 0;
  eventsCount = 0;
  attendanceCount = 0;
  membersCount = 0;

  upcomingEvents: any[] = [];
  completedEvents: any[] = [];

  user: any;

  // 📊 Charts
  attendanceChartData: any;
  attendanceChartOptions: any;

  eventsChartData: any;
  eventsChartOptions: any;

  constructor(
    private orgService: OrganizationService,
    private eventService: EventsService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private membersService: MembersService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.showWelcomeToast();
    this.loadStats();
    this.initCharts();
  }

  async loadUser() {
    this.user = await this.authService.getCurrentUserData();
  }

  showWelcomeToast() {
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
  }

  loadStats(): void {

    this.orgService.getAll().subscribe(res => {
      this.organizationsCount = res.length;
    });

    this.eventService.getAll().subscribe((res: any[]) => {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.upcomingEvents = [];
      this.completedEvents = [];

      res.forEach(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate > today) {
          this.upcomingEvents.push(e);
        } else {
          this.completedEvents.push(e);
        }
      });

      this.upcomingEvents = this.upcomingEvents.slice(0, 5);
      this.completedEvents = this.completedEvents.slice(0, 5);

      this.eventsCount = this.upcomingEvents.length;
    });

    this.attendanceService.getAll().subscribe(res => {
      this.attendanceCount = res.length;
    });

    this.membersService.getAll().subscribe(res => {
      this.membersCount = res.length;
    });
  }

  initCharts() {
    this.attendanceChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Attendance',
          data: [12, 19, 8, 15, 20],
          fill: true,
          tension: 0.4
        }
      ]
    };

    this.attendanceChartOptions = {
      plugins: { legend: { display: false } }
    };

    this.eventsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Events',
          data: [2, 5, 3, 6]
        }
      ]
    };

    this.eventsChartOptions = {
      plugins: { legend: { display: false } }
    };
  }

  trackByEvent(index: number, item: any) {
    return item.id || index;
  }
}