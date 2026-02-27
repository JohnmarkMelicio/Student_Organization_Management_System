import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss']
})
export class PaymentsComponent {

  api = 'http://localhost:3000';

  events: any[] = [];
  payments: any[] = [];

  usgPayments: any[] = [];
  eventPayments: any[] = [];

  newPayment: any = {
    type: 'USG',
    eventId: null,
    studentId: '',
    name: '',
    amount: null,
    paymentMethod: 'Cash',
    paymentDate: ''
  };

  constructor(private http: HttpClient) {
    this.loadEvents();
    this.loadPayments();
  }

  loadEvents() {
    this.http.get<any[]>(`${this.api}/events`)
      .subscribe(res => this.events = res);
  }

  loadPayments() {
    this.http.get<any[]>(`${this.api}/payments`)
      .subscribe(res => {
        this.payments = res;

        // 🔥 Separate payments
        this.usgPayments = res.filter(p => p.type === 'USG');
        this.eventPayments = res.filter(p => p.type === 'Event');
      });
  }

  addPayment() {
    if (!this.newPayment.studentId ||
        !this.newPayment.name ||
        !this.newPayment.amount) {
      alert("Please complete required fields");
      return;
    }

    this.http.post(`${this.api}/payments`, this.newPayment)
      .subscribe(() => {
        this.loadPayments();
        this.resetForm();
      });
  }

  deletePayment(id: number) {
    const confirmDelete = confirm("Delete this payment?");
    if (!confirmDelete) return;

    this.http.delete(`${this.api}/payments/${id}`)
      .subscribe(() => {
        this.loadPayments();
      });
  }

  getEventName(eventId: number): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : '-';
  }

  resetForm() {
    this.newPayment = {
      type: 'USG',
      eventId: null,
      studentId: '',
      name: '',
      amount: null,
      paymentMethod: 'Cash',
      paymentDate: ''
    };
  }

}