import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AttendanceService } from '../../../services/attendance.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

import Swal from 'sweetalert2'; // ✅ ADDED

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
  filteredAttendance: any[] = [];

  selectedEventId: string | null = null;

  editingId: string | null = null;

  isAdmin = false;

  searchText: string = '';

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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
        next: (res) => {
          this.attendanceList = res;
          this.applyFilters();
        },
        error: (err) => console.error(err)
      });
  }

  // 🔥 FILTER + SORT
  applyFilters(): void {

    let data = [...this.attendanceList];

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();

      data = data.filter(r =>
        r.studentId?.toLowerCase().includes(search) ||
        r.name?.toLowerCase().includes(search) ||
        r.program?.toLowerCase().includes(search)
      );
    }

    if (this.sortField) {
      data.sort((a, b) => {

        let valueA = a[this.sortField];
        let valueB = b[this.sortField];

        if (this.sortField === 'datetime') {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }

        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredAttendance = data;
  }

  searchAttendance(): void {
    this.applyFilters();
  }

  sortBy(field: string): void {

    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  async addAttendance() {

    if (!this.isAdmin) return;

    if (!this.selectedEventId) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Event',
        text: 'Please select an event'
      });
      return;
    }

    if (!this.newRecord.studentId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Student ID',
        text: 'Please enter Student ID'
      });
      return;
    }

    try {

      Swal.fire({
        title: 'Checking student...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('studentID', '==', this.newRecord.studentId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'Student not found'
        });
        return;
      }

      const userData: any = snapshot.docs[0].data();

      const record = {
        studentId: this.newRecord.studentId,
        name: `${userData.firstName} ${userData.lastName}`,
        program: userData.program,
        status: this.newRecord.status,
        eventId: this.selectedEventId,
        datetime: new Date().toLocaleString()
      };

      await this.attendanceService.create(record);

      Swal.fire({
        icon: 'success',
        title: 'Attendance Added!',
        timer: 1200,
        showConfirmButton: false
      });

      this.loadAttendance();
      this.resetForm();

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add attendance'
      });
    }
  }

  editRecord(record: any) {
    if (!this.isAdmin) return;
    this.editingId = record.id;
  }

  saveRecord(record: any) {
    if (!this.isAdmin) return;

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.attendanceService.update(record.id, record)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          timer: 1000,
          showConfirmButton: false
        });

        this.editingId = null;
        this.loadAttendance();
      })
      .catch((err:any) => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Update Failed'
        });
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.loadAttendance();
  }

  deleteRecord(id: string) {

    if (!this.isAdmin) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This record will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {

        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.attendanceService.delete(id)
          .then(() => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              timer: 1200,
              showConfirmButton: false
            });

            this.loadAttendance();
          })
          .catch((err:any) => {
            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed'
            });
          });
      }
    });
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