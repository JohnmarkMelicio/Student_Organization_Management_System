import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentsService } from '../../../services/payments.service';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // ✅ SEARCH
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

  // 🔥 SEARCH LOGIC
  applyFilters() {

    const search = this.searchText.toLowerCase();

    // USG FILTER
    this.filteredUSGPayments = this.usgPayments.filter(p =>
      p.studentId?.toLowerCase().includes(search) ||
      p.name?.toLowerCase().includes(search) ||
      p.program?.toLowerCase().includes(search)
    );

    // EVENT FILTER
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

      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('studentID', '==', this.newPayment.studentId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this.newPayment.name = '';
        this.newPayment.program = '';
        alert('Student not found');
        return;
      }

      const userData: any = snapshot.docs[0].data();

      this.newPayment.name =
        userData.firstName + ' ' + userData.lastName;

      this.newPayment.program =
        userData.program || '';

    } catch (err) {
      console.error(err);
    }

  }

  addPayment() {

    if (!this.newPayment.studentId ||
        !this.newPayment.name ||
        !this.newPayment.amount) {

      alert("Please complete required fields");
      return;
    }

    const payment = {
      ...this.newPayment,
      paymentDate: new Date().toISOString()
    };

    this.paymentsService.create(payment)
      .then(() => {
        this.loadPayments();
        this.resetForm();
      })
      .catch(err => console.error(err));
  }

  editPayment(payment:any) {
    this.editingId = payment.id;
  }

  savePayment(payment:any) {
    this.paymentsService.update(payment.id, payment)
      .then(() => {
        this.editingId = null;
        this.loadPayments();
      })
      .catch(err => console.error(err));
  }

  cancelEdit() {
    this.editingId = null;
    this.loadPayments();
  }

  deletePayment(id:string) {
    const confirmDelete = confirm("Delete this payment?");
    if (!confirmDelete) return;

    this.paymentsService.delete(id)
      .then(() => this.loadPayments())
      .catch(err => console.error(err));
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