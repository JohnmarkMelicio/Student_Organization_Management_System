import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Payment[]> {

    const ref = collection(this.firestore, 'payments');

    return collectionData(ref, { idField: 'id' }) as Observable<Payment[]>;

  }

  create(data: Payment) {

    const ref = collection(this.firestore, 'payments');

    return addDoc(ref, data as any);

  }

  update(id: string, data: Payment) {

    const ref = doc(this.firestore, `payments/${id}`);

    return updateDoc(ref, data as any);

  }

  delete(id: string) {

    const ref = doc(this.firestore, `payments/${id}`);

    return deleteDoc(ref);

  }

}