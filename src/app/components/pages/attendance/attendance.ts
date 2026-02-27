import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss']
})
export class AttendanceComponent {

  api = 'http://localhost:3000';

  events: any[] = [];
  attendanceList: any[] = [];
  selectedEventId: number | null = null;

  editingId: number | null = null; 

  newRecord: any = {
    studentId: '',
    name: '',
    program: '',
    status: 'Present',
    datetime: ''
  };

  constructor(private http: HttpClient) {
    this.loadEvents();
  }

  loadEvents() {
    this.http.get<any[]>(`${this.api}/events`)
      .subscribe(res => this.events = res);
  }

  loadAttendance() {
    if (!this.selectedEventId) return;

    this.http.get<any[]>(
      `${this.api}/attendance?eventId=${this.selectedEventId}`
    ).subscribe(res => this.attendanceList = res);
  }

  addAttendance() {
    if (!this.selectedEventId) return;

    const record = {
      ...this.newRecord,
      eventId: this.selectedEventId,
      datetime: new Date().toLocaleString()
    };

    this.http.post(`${this.api}/attendance`, record)
      .subscribe(() => {
        this.loadAttendance();
        this.resetForm();
      });
  }

  editRecord(record: any) {
    this.editingId = record.id;
  }
  deleteRecord(id: number) {
  const confirmDelete = confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) return;

  this.http.delete(`${this.api}/attendance/${id}`)
    .subscribe(() => {
      this.loadAttendance();
    });
}

  saveRecord(record: any) {
    this.http.put(`${this.api}/attendance/${record.id}`, record)
      .subscribe(() => {
        this.editingId = null;
        this.loadAttendance();
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.loadAttendance();
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