import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AttendanceService } from '../../../services/attendance.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

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

  isAdmin = false;

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
    private authService: AuthService,
    private firestore: Firestore
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

  async addAttendance() {

    if (!this.isAdmin) return;

    if (!this.selectedEventId) {
      alert('Please select an event');
      return;
    }

    if (!this.newRecord.studentId) {
      alert('Please enter Student ID');
      return;
    }

    try {

      
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('studentID', '==', this.newRecord.studentId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert('Student not found');
        return;
      }

      const userData: any = snapshot.docs[0].data();

      const fullName = `${userData.firstName} ${userData.lastName}`;
      const program = userData.program;

      const record = {
        studentId: this.newRecord.studentId,
        name: fullName,
        program: program,
        status: this.newRecord.status,
        eventId: this.selectedEventId,
        datetime: new Date().toLocaleString()
      };

      await this.attendanceService.create(record);

      this.loadAttendance();
      this.resetForm();

    } catch (error) {
      console.error(error);
      alert('Error adding attendance');
    }

  }

  editRecord(record: any) {

    if (!this.isAdmin) return;
    this.editingId = record.id;

  }

  saveRecord(record: any) {

    if (!this.isAdmin) return;

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

    if (!this.isAdmin) return;

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