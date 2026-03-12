import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentsService } from '../../../services/payments.service';
import { EventsService } from '../../../services/events.service';

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

  editingId: string | null = null;

  newPayment:any = {
    type: 'USG',
    eventId: null,
    studentId: '',
    name: '',
    amount: null,
    paymentMethod: 'Cash',
    paymentDate: ''
  };

  constructor(
    private paymentsService: PaymentsService,
    private eventsService: EventsService
  ) {}

  ngOnInit(): void {

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

      },

      error: (err) => console.error(err)

    });

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
      amount: null,
      paymentMethod: 'Cash',
      paymentDate: ''

    };

  }

}