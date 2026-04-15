import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 🔥 PrimeNG
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

// 🔥 Services
import { AttendanceService } from '../../../services/attendance.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

// 🔥 Firebase
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

// 🔥 Alerts
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    CardModule
  ]
})
export class AttendanceComponent implements OnInit {

  events: any[] = [];
  attendanceList: any[] = [];

  selectedEventId: string | null = null;

  isAdmin = false;

  newRecord: any = {
    studentId: '',
    status: 'Present'
  };

  statusOptions = [
    { label: 'Present', value: 'Present' },
    { label: 'Late', value: 'Late' },
    { label: 'Absent', value: 'Absent' }
  ];

  // ✅ EDITING STATE
  editingId: string | null = null;
  backupRecord: any = null;

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

  // 📌 LOAD EVENTS
  loadEvents() {
    this.eventsService.getAll().subscribe({
      next: (res) => this.events = res,
      error: (err) => console.error(err)
    });
  }

  // 📌 LOAD ATTENDANCE
  loadAttendance() {
    if (!this.selectedEventId) return;

    this.attendanceService.getByEvent(this.selectedEventId)
      .subscribe({
        next: (res) => this.attendanceList = res,
        error: (err) => console.error(err)
      });
  }

  // 🎨 STATUS COLOR
  getStatusSeverity(status: string) {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warn';
      case 'Absent': return 'danger';
      default: return 'info';
    }
  }

  // ➕ ADD ATTENDANCE
  async addAttendance() {

    if (!this.isAdmin) return;

    if (!this.selectedEventId) {
      Swal.fire('Select Event', 'Please select an event', 'warning');
      return;
    }

    if (!this.newRecord.studentId) {
      Swal.fire('Missing Student ID', 'Enter Student ID', 'warning');
      return;
    }

    // 🚫 PREVENT DUPLICATE
    const exists = this.attendanceList.find(a =>
      a.studentId === this.newRecord.studentId &&
      a.eventId === this.selectedEventId
    );

    if (exists) {
      Swal.fire('Duplicate', 'Student already recorded', 'warning');
      return;
    }

    try {

      Swal.fire({
        title: 'Checking student...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // 🔍 FIND USER
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('studentID', '==', this.newRecord.studentId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Swal.fire('Not Found', 'Student not found', 'error');
        return;
      }

      const userData: any = snapshot.docs[0].data();

      // ✅ EVENT-BASED STATUS
      const event = this.events.find(e => e.id === this.selectedEventId);

      const now = new Date();
      let status = this.newRecord.status;

      if (event) {
        const eventDate = new Date(event.date);

        if (!status || status === 'Present') {
          if (now < eventDate) {
            status = 'Present';
          } else {
            status = 'Late';
          }
        }
      }

      const record = {
        studentId: this.newRecord.studentId,
        name: `${userData.firstName} ${userData.lastName}`,
        program: userData.program,
        status,
        eventId: this.selectedEventId,
        datetime: now.toISOString()
      };

      await this.attendanceService.create(record);

      Swal.fire({
        icon: 'success',
        title: 'Attendance Added',
        timer: 1200,
        showConfirmButton: false
      });

      this.loadAttendance();
      this.resetForm();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to add attendance', 'error');
    }
  }

  // ✏️ EDIT (INLINE)
  editRecord(record: any) {
    if (!this.isAdmin) return;

    this.editingId = record.id;
    this.backupRecord = { ...record };
  }

  // 💾 SAVE
  saveRecord(record: any) {

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.attendanceService.update(record.id, record)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Updated',
          timer: 1000,
          showConfirmButton: false
        });

        this.editingId = null;
        this.loadAttendance();
      })
      .catch(() => {
        Swal.fire('Error', 'Update failed', 'error');
      });
  }

  // ❌ CANCEL
  cancelEdit() {

    if (!this.backupRecord) return;

    const index = this.attendanceList.findIndex(r => r.id === this.backupRecord.id);

    if (index !== -1) {
      this.attendanceList[index] = this.backupRecord;
    }

    this.editingId = null;
  }

  // ❌ DELETE
  deleteRecord(id: string) {

    if (!this.isAdmin) return;

    Swal.fire({
      title: 'Delete?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then((result) => {

      if (result.isConfirmed) {

        this.attendanceService.delete(id)
          .then(() => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              timer: 1000,
              showConfirmButton: false
            });

            this.loadAttendance();
          })
          .catch(() => {
            Swal.fire('Error', 'Delete failed', 'error');
          });
      }
    });
  }

  // 🔄 RESET
  resetForm() {
    this.newRecord = {
      studentId: '',
      status: 'Present'
    };
  }

}