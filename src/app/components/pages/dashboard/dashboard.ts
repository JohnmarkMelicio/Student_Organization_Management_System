import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationService } from '../../../services/organization.service';
import { EventsService } from '../../../services/events.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Organization } from '../../../models/organization.model';
import { Event } from '../../../models/event.model';

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
  membersCount = 0; // Temporary placeholder

  upcomingEvents: Event[] = [];

  constructor(
    private orgService: OrganizationService,
    private eventService: EventsService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
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

    // You can later replace this with real MemberService
    this.membersCount = 0;
  }
}