import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Attendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Attendance[]> {

    const ref = collection(this.firestore, 'attendance');

    return collectionData(ref, { idField: 'id' }) as Observable<Attendance[]>;

  }

  getByEvent(eventId: string): Observable<Attendance[]> {

    const ref = collection(this.firestore, 'attendance');

    const q = query(ref, where('eventId', '==', eventId));

    return collectionData(q, { idField: 'id' }) as Observable<Attendance[]>;

  }

  create(data: Attendance) {

    const ref = collection(this.firestore, 'attendance');

    return addDoc(ref, data as any);

  }

  update(id: string, data: Attendance) {

    const ref = doc(this.firestore, `attendance/${id}`);

    return updateDoc(ref, data as any);

  }

  delete(id: string) {

    const ref = doc(this.firestore, `attendance/${id}`);

    return deleteDoc(ref);

  }

}