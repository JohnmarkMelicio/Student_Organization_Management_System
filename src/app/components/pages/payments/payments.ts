import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentsService } from '../../../services/payments.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

import Swal from 'sweetalert2';

/* ✅ ADD THESE PRIME NG MODULES */
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    /* ✅ REQUIRED PRIME NG */
    CardModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    SelectModule
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})
export class PaymentsComponent implements OnInit {

  events: any[] = [];
  payments: any[] = [];

  usgPayments: any[] = [];
  eventPayments: any[] = [];

  filteredUSGPayments: any[] = [];
  filteredEventPayments: any[] = [];

  viewMode: string = 'USG';
  selectedEventId: string | null = null;

  editingId: string | null = null;

  isAdmin = false;

  searchText: string = '';

  newPayment:any = {
    type: 'USG',
    eventId: null,
    studentId: '',
    name: '',
    program: '',
    amount: null,
    paymentMethod: 'Cash',
    paymentDate: ''
  };

  constructor(
    private paymentsService: PaymentsService,
    private eventsService: EventsService,
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  async ngOnInit(): Promise<void> {

    const user: any = await this.authService.getCurrentUserData();
    this.isAdmin = user?.role === 'admin';

    this.loadEvents();
    this.loadPayments();
  }

  loadEvents() {
    this.eventsService.getAll().subscribe({
      next: (res) => this.events = res,
      error: (err) => console.error(err)
    });
  }

  loadPayments() {
    this.paymentsService.getAll().subscribe({
      next: (res) => {

        this.payments = res;

        this.usgPayments = res.filter(p => p.type === 'USG');
        this.eventPayments = res.filter(p => p.type === 'Event');

        this.applyFilters();

      },
      error: (err) => console.error(err)
    });
  }

  applyFilters() {

    const search = this.searchText.toLowerCase();

    this.filteredUSGPayments = this.usgPayments.filter(p =>
      p.studentId?.toLowerCase().includes(search) ||
      p.name?.toLowerCase().includes(search) ||
      p.program?.toLowerCase().includes(search)
    );

    let eventData = this.eventPayments;

    if (this.selectedEventId) {
      eventData = eventData.filter(p => p.eventId === this.selectedEventId);
    }

    this.filteredEventPayments = eventData.filter(p =>
      p.studentId?.toLowerCase().includes(search) ||
      p.name?.toLowerCase().includes(search) ||
      p.program?.toLowerCase().includes(search)
    );
  }

  searchPayments() {
    this.applyFilters();
  }

  onEventChange() {
    this.applyFilters();
  }

  async fetchStudent() {

    if (!this.newPayment.studentId) return;

    try {

      Swal.fire({
        title: 'Fetching student...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('studentID', '==', this.newPayment.studentId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {

        this.newPayment.name = '';
        this.newPayment.program = '';

        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'Student not found'
        });

        return;
      }

      const userData: any = snapshot.docs[0].data();

      this.newPayment.name =
        userData.firstName + ' ' + userData.lastName;

      this.newPayment.program =
        userData.program || '';

      Swal.close();

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error fetching student'
      });
    }
  }

  addPayment() {

    if (!this.newPayment.studentId ||
        !this.newPayment.name ||
        !this.newPayment.amount) {

      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please complete required fields'
      });

      return;
    }

    const payment = {
      ...this.newPayment,
      paymentDate: new Date().toISOString()
    };

    Swal.fire({
      title: 'Processing payment...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.paymentsService.create(payment)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Payment Added!',
          timer: 1200,
          showConfirmButton: false
        });

        this.loadPayments();
        this.resetForm();
      })
      .catch(err => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Failed to save payment'
        });
      });
  }

  editPayment(payment:any) {
    this.editingId = payment.id;
  }

  savePayment(payment:any) {

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.paymentsService.update(payment.id, payment)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          timer: 1000,
          showConfirmButton: false
        });

        this.editingId = null;
        this.loadPayments();
      })
      .catch(err => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Update Failed'
        });
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.loadPayments();
  }

  deletePayment(id:string) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This payment will be deleted!',
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

        this.paymentsService.delete(id)
          .then(() => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              timer: 1200,
              showConfirmButton: false
            });

            this.loadPayments();
          })
          .catch(err => {
            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed'
            });
          });
      }
    });
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : '-';
  }

  resetForm() {
    this.newPayment = {
      type: 'USG',
      eventId: null,
      studentId: '',
      name: '',
      program: '',
      amount: null,
      paymentMethod: 'Cash',
      paymentDate: ''
    };
  }

}