import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AttendanceService } from '../../../services/attendance.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service'; // ✅ ADD

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss']
})
export class AttendanceComponent implements OnInit {

  events: any[] = [];
  attendanceList: any[] = [];

  selectedEventId: string | null = null;

  editingId: string | null = null;

  isAdmin = false; // ✅ ADD

  newRecord: any = {
    studentId: '',
    name: '',
    program: '',
    status: 'Present',
    datetime: ''
  };

  constructor(
    private attendanceService: AttendanceService,
    private eventsService: EventsService,
    private authService: AuthService // ✅ ADD
  ) {}

  async ngOnInit(): Promise<void> {

    const user: any = await this.authService.getCurrentUserData();

    if (user) {
      this.isAdmin = user.role === 'admin';
    }

    this.loadEvents();
  }

  loadEvents() {

    this.eventsService.getAll().subscribe({
      next: (res) => this.events = res,
      error: (err) => console.error(err)
    });

  }

  loadAttendance() {

    if (!this.selectedEventId) return;

    this.attendanceService.getByEvent(this.selectedEventId)
      .subscribe({
        next: (res) => this.attendanceList = res,
        error: (err) => console.error(err)
      });

  }

  addAttendance() {

    if (!this.isAdmin) return; // ✅ PROTECT

    if (!this.selectedEventId) return;

    const record = {
      ...this.newRecord,
      eventId: this.selectedEventId,
      datetime: new Date().toLocaleString()
    };

    this.attendanceService.create(record)
      .then(() => {
        this.loadAttendance();
        this.resetForm();
      })
      .catch((err:any) => console.error(err));

  }

  editRecord(record: any) {

    if (!this.isAdmin) return; // ✅ PROTECT
    this.editingId = record.id;

  }

  saveRecord(record: any) {

    if (!this.isAdmin) return; // ✅ PROTECT

    this.attendanceService.update(record.id, record)
      .then(() => {
        this.editingId = null;
        this.loadAttendance();
      })
      .catch((err:any) => console.error(err));

  }

  cancelEdit() {

    this.editingId = null;
    this.loadAttendance();

  }

  deleteRecord(id: string) {

    if (!this.isAdmin) return; // ✅ PROTECT

    const confirmDelete = confirm("Delete this record?");
    if (!confirmDelete) return;

    this.attendanceService.delete(id)
      .then(() => this.loadAttendance())
      .catch((err:any) => console.error(err));

  }

  resetForm() {

    this.newRecord = {
      studentId: '',
      name: '',
      program: '',
      status: 'Present',
      datetime: ''
    };

  }

}